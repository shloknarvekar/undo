/**
 * Money router: turns a fault-engine decision into PayPal calls, order state and chained events.
 * Plus the undo-window scheduler (captureDue). Every PayPal call is idempotent by request id, and every
 * state change is conditional on the status we read, so the scheduler and an Undo racing each other can't
 * double-move money.
 */
import { and, eq, lte } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { canonicalJson, sha256Hex } from "./crypto";
import { appendEvent, chain } from "./events";
import type { Decision, MoneyAction } from "./fault-core";
import { route } from "./fault-core";
import { paypal, PayPalError } from "./paypal";

type OrderRow = typeof schema.orders.$inferSelect;

/** PayPal US checkout fee, used only to show merchants what a void (vs. refund) saved them. Estimate. */
const estimatedFee = (amount: string) => (Number(amount) * 0.0349 + 0.49).toFixed(2);

async function transition(order: OrderRow, to: OrderRow["status"], values: Partial<typeof schema.orders.$inferInsert> = {}) {
  const rows = await getDb()
    .update(schema.orders)
    .set({ ...values, status: to, updatedAt: new Date() })
    .where(and(eq(schema.orders.id, order.id), eq(schema.orders.status, order.status)))
    .returning({ id: schema.orders.id });
  if (!rows.length) throw new StaleOrder(order.id);
}

export class StaleOrder extends Error {
  constructor(id: string) {
    super(`Order ${id} changed while being processed`);
  }
}

/** Capture one authorized order whose window has closed. Returns the capture id, or null if not due. */
export async function captureOrder(order: OrderRow, reason: string): Promise<string | null> {
  if (order.status !== "AUTHORIZED" || !order.authorizationId) return null;
  const capture = await paypal.captureAuthorization(order.authorizationId);
  await transition(order, "CAPTURED", { captureId: capture.id });
  await appendEvent(order.mandateId, "PAYMENT_CAPTURED", { orderId: order.id, captureId: capture.id, amount: capture.amount, reason });
  return capture.id;
}

/** The scheduler: capture every order whose undo window has closed. Safe to run concurrently. */
export async function captureDue(limit = 10) {
  const due = await getDb()
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.status, "AUTHORIZED"), lte(schema.orders.windowEndsAt, new Date())))
    .limit(limit);
  const results: { orderId: string; captureId?: string; error?: string }[] = [];
  for (const order of due) {
    try {
      results.push({ orderId: order.id, captureId: (await captureOrder(order, "undo window closed")) ?? undefined });
    } catch (err) {
      if (err instanceof StaleOrder) continue; // an Undo got there first
      const error = err instanceof PayPalError ? err.message : String(err);
      await appendEvent(order.mandateId, "CAPTURE_FAILED", { orderId: order.id, error });
      results.push({ orderId: order.id, error });
    }
  }
  return results;
}

let lastSweep = 0;
/** Opportunistic scheduler for a free host with no cron: piggybacks on traffic, at most once a minute. */
export function maybeSweep() {
  if (!process.env.DATABASE_URL || Date.now() - lastSweep < 60_000) return;
  lastSweep = Date.now();
  captureDue().catch((err) => console.error("capture sweep failed:", err instanceof Error ? err.message : err));
}

/** Evidence pack: what a merchant, PayPal or a judge needs to check the verdict, with a digest for integrity. */
async function evidencePack(order: OrderRow, decision: Decision) {
  const history = await chain(order.mandateId);
  const pack = {
    orderId: order.id,
    mandateId: order.mandateId,
    purchased: order.product,
    amount: `${order.amount} ${order.currency}`,
    verdict: decision.verdict,
    confidence: decision.confidence,
    evidence: decision.evidence,
    chain: { intact: history.intact, head: history.events.at(-1)?.hash ?? null, length: history.events.length },
  };
  return { ...pack, digest: sha256Hex(canonicalJson(pack)) };
}

export type UndoOutcome = { action: MoneyAction; status: OrderRow["status"]; paypal: Record<string, string | null>; evidenceDigest?: string };

/** Execute the money action for a decision. Re-routes once if the window closed mid-Undo (void → capture race). */
export async function executeUndo(order: OrderRow, decision: Decision, attempt = 0): Promise<UndoOutcome> {
  const action = route(decision.verdict, order.status, order.amount);
  const resolution = { decision, action, at: new Date().toISOString() };
  const ev = (type: string, payload: object) => appendEvent(order.mandateId, type, { orderId: order.id, ...payload });

  switch (action.type) {
    case "VOID": {
      try {
        const voided = await paypal.voidAuthorization(order.authorizationId!);
        await transition(order, "VOIDED", { resolution });
        await ev("PAYMENT_VOIDED", { authorizationId: order.authorizationId, status: voided.status ?? "VOIDED", estimatedFeesAvoided: estimatedFee(order.amount), liability: decision.liability });
        return { action, status: "VOIDED", paypal: { authorizationId: order.authorizationId } };
      } catch (err) {
        // The scheduler may have captured it a moment ago: find the capture and route again as CAPTURED.
        if (attempt > 0 || !order.paypalOrderId) throw err;
        const fresh = await paypal.getOrder(order.paypalOrderId);
        const captureId = fresh.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        if (!captureId) throw err;
        const [row] = await getDb().select().from(schema.orders).where(eq(schema.orders.id, order.id)).limit(1);
        return executeUndo({ ...row, status: "CAPTURED", captureId }, decision, attempt + 1);
      }
    }
    case "REFUND_FULL": {
      const refund = await paypal.refundCapture(order.captureId!, undefined, "Undo: your agent's purchase broke your mandate — full refund.", "full");
      await transition(order, "REFUNDED", { resolution });
      await ev("PAYMENT_REFUNDED", { captureId: order.captureId, refundId: refund.id, amount: refund.amount, kind: "full" });
      await ev("LIABILITY_ASSIGNED", { party: "agent_operator", amount: `${order.amount} ${order.currency}`, note: "merchant made whole by the agent operator" });
      return { action, status: "REFUNDED", paypal: { captureId: order.captureId, refundId: refund.id } };
    }
    case "OPEN_CLAIM": {
      const pack = await evidencePack(order, decision);
      await transition(order, "CLAIM_OPEN", { resolution: { ...resolution, evidencePack: pack } });
      await ev("CLAIM_OPENED", { against: "merchant", evidenceDigest: pack.digest, evidence: decision.evidence });
      return { action, status: "CLAIM_OPEN", paypal: { captureId: order.captureId }, evidenceDigest: pack.digest };
    }
    case "AUTHORIZE_RETURN": {
      await transition(order, "RETURN_PENDING", { resolution });
      await ev("RETURN_AUTHORIZED", { refundOnReturn: action.refundOnReturn, restockingFee: action.restockingFee, currency: order.currency });
      return { action, status: "RETURN_PENDING", paypal: { captureId: order.captureId } };
    }
    case "REVIEW": {
      const pack = await evidencePack(order, decision);
      await transition(order, "REVIEW", { resolution: { ...resolution, evidencePack: pack } });
      await ev("REVIEW_REQUIRED", { evidenceDigest: pack.digest, confidence: decision.confidence });
      return { action, status: "REVIEW", paypal: {}, evidenceDigest: pack.digest };
    }
    case "NONE":
      return { action, status: order.status, paypal: {} };
  }
}

/** Merchant-side completions (sandbox demo; the merchant console calls these). */
export async function resolveByMerchant(order: OrderRow, act: "accept_claim" | "return_received") {
  if (act === "accept_claim") {
    if (order.status !== "CLAIM_OPEN") throw new StaleOrder(order.id);
    const refund = await paypal.refundCapture(order.captureId!, undefined, "Undo: merchant accepted the claim — full refund.", "claim");
    await transition(order, "REFUNDED");
    await appendEvent(order.mandateId, "CLAIM_ACCEPTED", { orderId: order.id, refundId: refund.id, amount: refund.amount, liability: "merchant" });
    return { status: "REFUNDED" as const, refundId: refund.id };
  }
  if (order.status !== "RETURN_PENDING") throw new StaleOrder(order.id);
  const { action } = order.resolution as { action: Extract<MoneyAction, { type: "AUTHORIZE_RETURN" }> };
  const refund = await paypal.refundCapture(
    order.captureId!,
    { currency_code: order.currency, value: action.refundOnReturn },
    `Undo: return received — refund minus ${action.restockingFee} restocking fee.`,
    "return",
  );
  await transition(order, "PARTIALLY_REFUNDED");
  await appendEvent(order.mandateId, "RETURN_RECEIVED", { orderId: order.id, refundId: refund.id, refunded: refund.amount, restockingFee: action.restockingFee });
  return { status: "PARTIALLY_REFUNDED" as const, refundId: refund.id };
}
