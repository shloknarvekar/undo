/**
 * Tamper-evidence primitives for Undo: canonical JSON, SHA-256, Ed25519 signatures, and the hash chain
 * that links every event about a purchase. Pure functions, no I/O.
 *
 * Signatures are raw Ed25519 (64 bytes) over UTF-8 bytes, keys are raw 32-byte public keys — the same
 * format the browser's WebCrypto produces, so a shopper's device can sign and the server can verify.
 */
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from "node:crypto";

/** JSON with object keys sorted at every level, so the same data always hashes the same. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .filter((k) => (value as Record<string, unknown>)[k] !== undefined)
        .sort()
        .map((k) => [k, sortKeys((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

export function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

// Ed25519 SPKI DER = this 12-byte prefix + the 32-byte raw public key.
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export function publicKeyFromRaw(rawB64: string) {
  const raw = Buffer.from(rawB64, "base64");
  if (raw.length !== 32) throw new Error("Ed25519 public key must be 32 bytes");
  return createPublicKey({ key: Buffer.concat([ED25519_SPKI_PREFIX, raw]), format: "der", type: "spki" });
}

export function verifySignature(publicKeyB64: string, message: string, signatureB64: string): boolean {
  try {
    return verify(null, Buffer.from(message, "utf8"), publicKeyFromRaw(publicKeyB64), Buffer.from(signatureB64, "base64"));
  } catch {
    return false;
  }
}

/** Server-side keys for scripts, tests and the demo shopper. Real shoppers sign on their own device. */
export function generateSigningKey(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const spki = publicKey.export({ format: "der", type: "spki" });
  return {
    publicKey: spki.subarray(ED25519_SPKI_PREFIX.length).toString("base64"),
    privateKey: privateKey.export({ format: "der", type: "pkcs8" }).toString("base64"),
  };
}

export function signMessage(privateKeyB64: string, message: string): string {
  const key = createPrivateKey({ key: Buffer.from(privateKeyB64, "base64"), format: "der", type: "pkcs8" });
  return sign(null, Buffer.from(message, "utf8"), key).toString("base64");
}

/** Hash chain: each event commits to the previous one, so editing or deleting history breaks every later hash. */
export const GENESIS = "0".repeat(64);

export type ChainedEvent = {
  subjectId: string;
  seq: number;
  type: string;
  payload: unknown;
  createdAt: string;
  prevHash: string;
  hash: string;
};

export function eventHash(e: Omit<ChainedEvent, "hash">): string {
  const { subjectId, seq, type, payload, createdAt, prevHash } = e;
  return sha256Hex(prevHash + canonicalJson({ subjectId, seq, type, payload, createdAt }));
}

export function chainNext(
  prev: Pick<ChainedEvent, "seq" | "hash"> | null,
  e: Pick<ChainedEvent, "subjectId" | "type" | "payload" | "createdAt">,
): ChainedEvent {
  const base = { ...e, seq: prev ? prev.seq + 1 : 0, prevHash: prev ? prev.hash : GENESIS };
  return { ...base, hash: eventHash(base) };
}

/** Returns the index of the first broken link, or -1 if the whole chain checks out. */
export function verifyChain(events: ChainedEvent[]): number {
  let prev: ChainedEvent | null = null;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const expectedPrev = prev ? prev.hash : GENESIS;
    const expectedSeq = prev ? prev.seq + 1 : 0;
    if (e.prevHash !== expectedPrev || e.seq !== expectedSeq || e.hash !== eventHash(e)) return i;
    prev = e;
  }
  return -1;
}
