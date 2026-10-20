/**
 * Saved wallets: a shopper's PayPal wallet vaulted with PayPal, tied to the device key that asked for it.
 *
 * Saving: the device signs "save my wallet" → Undo opens a PayPal setup token → the shopper approves once in PayPal →
 * the return route turns it into a payment token (the vault id) and marks the wallet ACTIVE. Forgetting: the device
 * signs "forget my wallet" → the payment token is deleted at PayPal. A wallet is only ever used for a purchase whose
 * signed mandate says `payWith: "saved_wallet"` (lib/checkout.ts), and that purchase is still only authorized, with an
 * undo window.
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { verifySignature } from "./crypto";
import { appendEvent } from "./events";
import { vault } from "./paypal";

export type WalletAction = "save" | "forget";
const MAX_SKEW_MS = 10 * 60_000;

/** The exact string the shopper's device signs to save or forget a wallet. Domain-separated from mandates and undos. */
export function walletMessage(action: WalletAction, shopperKey: string, requestedAt: string): string {
  return `undo-wallet-v1:${action}:${shopperKey}:${requestedAt}`;
}

/** A wallet request must be signed by the key it is for, and recent (so a captured signature can't be replayed later). */
export function checkWalletRequest(
  r: { action: WalletAction; shopperKey: string; requestedAt: string; signature: string },
  now = new Date(),
): { ok: true } | { ok: false; error: "stale_request" | "bad_signature" } {
  const at = Date.parse(r.requestedAt);
  if (!Number.isFinite(at) || Math.abs(now.getTime() - at) > MAX_SKEW_MS) return { ok: false, error: "stale_request" };
  if (!verifySignature(r.shopperKey, walletMessage(r.action, r.shopperKey, r.requestedAt), r.signature)) return { ok: false, error: "bad_signature" };
  return { ok: true };
}

/** Where PayPal may send the shopper back to: the shop, or one mandate-request signing page. Anything else → /shop. */
export function safeReturnTo(path: string | null | undefined): string {
  return path && /^\/(shop|mandates\/sign\/[0-9a-f-]{36})$/i.test(path) ? path : "/shop";
}

/** Short label for the event chain: which device, without the full key. */
const keyLabel = (shopperKey: string) => `${shopperKey.slice(0, 10)}…`;

export async function activeWallet(shopperKey: string) {
  const [w] = await getDb()
    .select()
    .from(schema.wallets)
    .where(and(eq(schema.wallets.shopperKey, shopperKey), eq(schema.wallets.status, "ACTIVE")))
    .orderBy(desc(schema.wallets.updatedAt))
    .limit(1);
  return w && w.vaultId ? { id: w.id, vaultId: w.vaultId, since: w.updatedAt } : null;
}

/** Starts saving a wallet: returns the PayPal page where the shopper approves it. */
export async function startSave(o: { shopperKey: string; returnTo: string; baseUrl: string }): Promise<{ approveUrl: string }> {
  const id = randomUUID();
  const returnTo = safeReturnTo(o.returnTo);
  const token = await vault.createSetupToken({
    returnUrl: `${o.baseUrl}/api/wallets/return?w=${id}`,
    cancelUrl: `${o.baseUrl}${returnTo}?wallet=cancelled`,
  });
  const approveUrl = token.links?.find((l) => l.rel === "approve")?.href;
  if (!approveUrl) throw new Error(`setup token ${token.id} has no approval link`);
  await getDb().insert(schema.wallets).values({ id, shopperKey: o.shopperKey, setupTokenId: token.id, returnTo });
  return { approveUrl };
}

/**
 * PayPal sent the shopper back: if they approved, create the payment token and make this the device's one active
 * wallet. Safe to hit twice (the payment-token call has a fixed request id, and an ACTIVE wallet is left as is).
 */
export async function completeSave(walletId: string): Promise<{ returnTo: string; outcome: "saved" | "not_approved" | "unknown" }> {
  const db = getDb();
  const [w] = await db.select().from(schema.wallets).where(eq(schema.wallets.id, walletId)).limit(1);
  if (!w) return { returnTo: "/shop", outcome: "unknown" };
  if (w.status === "ACTIVE") return { returnTo: w.returnTo, outcome: "saved" };
  if (w.status !== "PENDING") return { returnTo: w.returnTo, outcome: "not_approved" };

  const setup = await vault.getSetupToken(w.setupTokenId);
  if (setup.status !== "APPROVED") return { returnTo: w.returnTo, outcome: "not_approved" };
  const token = await vault.createPaymentToken(w.setupTokenId);

  // One active wallet per device: older ones are retired (and deleted at PayPal) once the new one exists.
  const older = await db
    .select()
    .from(schema.wallets)
    .where(and(eq(schema.wallets.shopperKey, w.shopperKey), eq(schema.wallets.status, "ACTIVE")));
  await db
    .update(schema.wallets)
    .set({ status: "ACTIVE", vaultId: token.id, customerId: token.customer?.id ?? null, updatedAt: new Date() })
    .where(eq(schema.wallets.id, w.id));
  for (const o of older) await retire(o.id, o.vaultId);
  await appendEvent(`wallet:${w.shopperKey}`, "WALLET_SAVED", { walletId: w.id, device: keyLabel(w.shopperKey), paymentTokenId: token.id });
  return { returnTo: w.returnTo, outcome: "saved" };
}

async function retire(walletId: string, vaultId: string | null) {
  if (vaultId) await vault.deletePaymentToken(vaultId).catch((err) => console.error("delete payment token failed:", err instanceof Error ? err.message : err));
  await getDb().update(schema.wallets).set({ status: "REVOKED", updatedAt: new Date() }).where(eq(schema.wallets.id, walletId));
}

/** Forgets every active wallet for this device: deleted at PayPal, and no agent can use it any more. */
export async function forget(shopperKey: string): Promise<number> {
  const active = await getDb()
    .select()
    .from(schema.wallets)
    .where(and(eq(schema.wallets.shopperKey, shopperKey), eq(schema.wallets.status, "ACTIVE")));
  for (const w of active) await retire(w.id, w.vaultId);
  if (active.length) await appendEvent(`wallet:${shopperKey}`, "WALLET_FORGOTTEN", { device: keyLabel(shopperKey), wallets: active.length });
  return active.length;
}
