"use client";

/**
 * The shopper's signing key, generated and kept on this device with WebCrypto (Ed25519).
 * The private key is non-extractable and lives in IndexedDB: Undo's server only ever sees the public key and
 * signatures. Output format (raw 32-byte public key, raw 64-byte signature, base64) matches src/lib/crypto.ts.
 */
const DB = "undo-device";
const STORE = "keys";
const ID = "shopper";

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, value: unknown): Promise<void> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));

export class DeviceKeyUnsupported extends Error {}

export type DeviceKey = { publicKey: string; fingerprint: string; sign: (message: string) => Promise<string> };

export async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getDeviceKey(): Promise<DeviceKey> {
  if (!globalThis.crypto?.subtle || !globalThis.indexedDB) throw new DeviceKeyUnsupported("This browser can't create signing keys.");
  let pair = await idbGet<CryptoKeyPair>(ID);
  if (!pair) {
    try {
      pair = (await crypto.subtle.generateKey({ name: "Ed25519" }, false, ["sign", "verify"])) as CryptoKeyPair;
    } catch {
      throw new DeviceKeyUnsupported("This browser doesn't support Ed25519 signing yet. Try a current Chrome, Edge, Firefox or Safari.");
    }
    await idbPut(ID, pair);
  }
  const raw = await crypto.subtle.exportKey("raw", pair.publicKey);
  const publicKey = b64(raw);
  const fingerprint = (await sha256Hex(raw)).slice(0, 12);
  const privateKey = pair.privateKey;
  return {
    publicKey,
    fingerprint,
    sign: async (message) => b64(await crypto.subtle.sign({ name: "Ed25519" }, privateKey, new TextEncoder().encode(message))),
  };
}

/** Same string as fault-core's undoSigningMessage (server verifies it with the mandate's public key). */
export async function undoMessage(orderId: string, reason: string, photoSha256: string | null, requestedAt: string) {
  return `undo-request-v1:${orderId}:${await sha256Hex(reason)}:${photoSha256 ?? "-"}:${requestedAt}`;
}
