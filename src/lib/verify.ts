/**
 * Verify it yourself: re-checks an order's evidence with the viewer's own WebCrypto (SHA-256 and Ed25519), using the
 * raw events from GET /api/orders/:id/evidence. Nothing here trusts the server's own "intact" flag.
 *
 *   - every event's hash is recomputed: sha256(prevHash + canonicalJson({ subjectId, seq, type, payload, createdAt })),
 *     and each event must point at the hash before it (the first at 64 zeros);
 *   - the signed mandate must still hash to the digest in its MANDATE_SIGNED event, and the shopper's Ed25519 signature
 *     must verify over `undo-intent-mandate-v<version>:<digest>`;
 *   - every Undo request must carry a valid signature by the same key over
 *     `undo-request-v1:<orderId>:<sha256(reason)>:<photoSha256 | ->:<requestedAt>`.
 *
 * Browser-safe (no Node imports); also runs under Node 22+, which has the same WebCrypto. The message formats mirror
 * lib/mandate.ts (signingMessage) and lib/fault-core.ts (undoSigningMessage); tests/verify.test.ts pins them together.
 */
import { canonicalJson } from "./canonical";

export type RawEvent = { subjectId: string; seq: number; type: string; payload: unknown; createdAt: string; prevHash: string; hash: string };
export type Evidence = { format: string; orderId: string; mandate: Record<string, unknown> | null; events: RawEvent[] };

export type StepCheck = { seq: number; type: string; ok: boolean; problem: "hash" | "link" | null; recomputed: string };
export type SignatureCheck = { what: "mandate" | "undo"; seq: number; ok: boolean; detail: string };
export type Report = {
  steps: StepCheck[];
  /** Index of the first event that fails, or -1. Everything after it can't be trusted either. */
  brokenAt: number;
  signatures: SignatureCheck[];
  ok: boolean;
  ms: number;
};

export const GENESIS = "0".repeat(64);
const enc = new TextEncoder();

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** True if this browser can check Ed25519 signatures with WebCrypto. */
export async function ed25519Supported(): Promise<boolean> {
  try {
    await crypto.subtle.importKey("raw", new Uint8Array(32), { name: "Ed25519" }, false, ["verify"]);
    return true;
  } catch {
    return false;
  }
}

async function ed25519Verify(publicKeyB64: string, message: string, signatureB64: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey("raw", fromB64(publicKeyB64) as BufferSource, { name: "Ed25519" }, false, ["verify"]);
    return await crypto.subtle.verify({ name: "Ed25519" }, key, fromB64(signatureB64) as BufferSource, enc.encode(message));
  } catch {
    return false;
  }
}

const record = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

export async function verifyEvidence(ev: Evidence): Promise<Report> {
  const started = performance.now();

  // 1. The hash chain.
  const steps: StepCheck[] = [];
  let brokenAt = -1;
  for (let i = 0; i < ev.events.length; i++) {
    const e = ev.events[i];
    const prev = i > 0 ? ev.events[i - 1] : null;
    const recomputed = await sha256Hex(
      e.prevHash + canonicalJson({ subjectId: e.subjectId, seq: e.seq, type: e.type, payload: e.payload, createdAt: e.createdAt }),
    );
    const linked = e.prevHash === (prev ? prev.hash : GENESIS) && e.seq === (prev ? prev.seq + 1 : 0);
    const problem = recomputed !== e.hash ? "hash" : !linked ? "link" : null;
    if (problem && brokenAt === -1) brokenAt = i;
    steps.push({ seq: e.seq, type: e.type, ok: problem === null && brokenAt === -1, problem, recomputed });
  }

  // 2. The shopper's signatures.
  const signatures: SignatureCheck[] = [];
  const shopperKey = typeof ev.mandate?.shopperKey === "string" ? ev.mandate.shopperKey : null;
  const signedEvent = ev.events.find((e) => e.type === "MANDATE_SIGNED");
  if (signedEvent) {
    const p = record(signedEvent.payload);
    if (!ev.mandate || !shopperKey) {
      signatures.push({ what: "mandate", seq: signedEvent.seq, ok: false, detail: "The signed mandate wasn't included, so its signature can't be checked." });
    } else {
      const digest = await sha256Hex(canonicalJson(ev.mandate));
      const sigOk = await ed25519Verify(shopperKey, `undo-intent-mandate-v${String(ev.mandate.version)}:${digest}`, String(p.signature ?? ""));
      signatures.push({
        what: "mandate",
        seq: signedEvent.seq,
        ok: sigOk && digest === p.digest,
        detail: !sigOk
          ? "The shopper's signature doesn't match this mandate: its terms were changed after signing."
          : digest !== p.digest
            ? "The mandate doesn't match the digest recorded when it was signed."
            : "The shopper's device key signed exactly these terms.",
      });
    }
  }
  for (const e of ev.events.filter((x) => x.type === "UNDO_REQUESTED")) {
    const p = record(e.payload);
    const message = `undo-request-v1:${String(p.orderId)}:${await sha256Hex(String(p.reason ?? ""))}:${p.photoSha256 ?? "-"}:${String(p.requestedAt)}`;
    const ok = shopperKey ? await ed25519Verify(shopperKey, message, String(p.signature ?? "")) : false;
    signatures.push({
      what: "undo",
      seq: e.seq,
      ok,
      detail: ok ? "The undo was signed by the same device that signed the mandate." : "This undo request's signature doesn't match: its words or time were changed.",
    });
  }

  return {
    steps,
    brokenAt,
    signatures,
    ok: brokenAt === -1 && signatures.every((s) => s.ok),
    ms: Math.round(performance.now() - started),
  };
}

// ── Tampering (on a local copy only) ──────────────────────────────────────────────────────────────

export type Tamper = "amount" | "verdict" | "budget" | "delete";

export const TAMPERS: Record<Tamper, { label: string; what: string }> = {
  amount: { label: "Edit an amount", what: "Changes the last amount PayPal recorded to $1.00." },
  verdict: { label: "Change who's at fault", what: "Rewrites the verdict to blame someone else." },
  budget: { label: "Raise the signed budget", what: "Multiplies the mandate's budget by ten." },
  delete: { label: "Delete a step", what: "Removes one step from the middle of the history." },
};

const lastWithAmount = (events: RawEvent[]) => [...events].reverse().find((x) => "amount" in record(x.payload));

/** Which tampers make sense for this evidence. */
export function availableTampers(ev: Evidence): Tamper[] {
  return (Object.keys(TAMPERS) as Tamper[]).filter((t) =>
    t === "amount"
      ? Boolean(lastWithAmount(ev.events))
      : t === "verdict"
        ? ev.events.some((e) => e.type === "VERDICT")
        : t === "budget"
          ? Boolean(ev.mandate && "intent" in ev.mandate)
          : ev.events.length >= 3,
  );
}

/** The step a tamper touches (null when it changes the mandate rather than an event). */
export function tamperedSeq(ev: Evidence, kind: Tamper): number | null {
  if (kind === "amount") return lastWithAmount(ev.events)?.seq ?? null;
  if (kind === "verdict") return ev.events.find((x) => x.type === "VERDICT")?.seq ?? null;
  if (kind === "delete") return ev.events[Math.floor(ev.events.length / 2)]?.seq ?? null;
  return null;
}

/** A deep copy of the evidence with one thing changed, the way someone rewriting history would. */
export function tamper(ev: Evidence, kind: Tamper): Evidence {
  const copy: Evidence = structuredClone(ev);
  if (kind === "amount") {
    const p = record(lastWithAmount(copy.events)?.payload);
    p.amount = p.amount && typeof p.amount === "object" ? { ...(p.amount as object), value: "1.00" } : "1.00 USD";
  } else if (kind === "verdict") {
    // Always shift the blame to someone else: the shopper, or the merchant if the shopper was already blamed.
    const p = record(copy.events.find((x) => x.type === "VERDICT")?.payload);
    const blamedShopper = p.verdict === "SHOPPER_CHANGED_MIND";
    p.verdict = blamedShopper ? "MERCHANT_FAULT" : "SHOPPER_CHANGED_MIND";
    p.liability = blamedShopper ? "merchant" : "shopper";
  } else if (kind === "budget" && copy.mandate) {
    const intent = record(copy.mandate.intent);
    intent.maxPrice = Number(intent.maxPrice ?? 0) * 10;
  } else if (kind === "delete") {
    copy.events.splice(Math.floor(copy.events.length / 2), 1);
  }
  return copy;
}
