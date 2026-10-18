/**
 * Money router: turns a fault-engine decision into PayPal calls, order state and chained events.
 * Plus the undo-window scheduler (captureDue). Every PayPal call is idempotent by request id, and every
 * state change is conditional on the status we read, so the scheduler and an Undo racing each other can't
 * double-move money.
 */
import { and, eq, lte, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { canonicalJson, sha256Hex } from "./crypto";
import { appendEvent, chain } from "./events";
import type { Decision, MoneyAction } from "./fault-core";
import { route } from "./fault-core";
import { operatorConfigured, paypal, PayPalError, payouts } from "./paypal";

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
  refreshSettlements().catch((err) => console.error("settlement sweep failed:", err instanceof Error ? err.message : err));
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
      await ev("LIABILITY_ASSIGNED", { party: "agent_operator", operator: operatorName(order), amount: `${order.amount} ${order.currency}` });
      // The shopper is already refunded; now the agent operator pays the merchant back from its own PayPal account.
      // A failed payout is recorded and retryable; it never touches the shopper's refund.
      const settlement = await settleAgentLiability({ ...order, status: "REFUNDED" }, refund.amount?.value ?? order.amount, 1);
      return { action, status: "REFUNDED", paypal: { captureId: order.captureId, refundId: refund.id, payoutBatchId: settlement.payoutBatchId ?? null } };
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

/**
 * Agent-fault liability settlement. When an agent broke the mandate and the merchant had to refund a captured
 * payment, the agent operator pays the merchant that amount back through PayPal Payouts, from the operator's own
 * account (the same idea as 3-D Secure shifting chargeback liability off the merchant).
 */
export type Settlement = {
  status: "PENDING" | "SUCCESS" | "FAILED" | "UNCLAIMED" | "NOT_CONFIGURED";
  amount: string;
  currency: string;
  from: string;
  to: string | null;
  attempt: number;
  payoutBatchId?: string;
  payoutItemId?: string;
  transactionId?: string;
  error?: string;
  at: string;
};

export function operatorName(order: OrderRow): string {
  const agent = order.agent as { operator?: { name: string }; simulated?: string };
  return agent.operator?.name ?? (agent.simulated ? "Careless demo agent" : "Undo web agent");
}

async function saveSettlement(order: OrderRow, settlement: Settlement) {
  const [row] = await getDb().select({ resolution: schema.orders.resolution }).from(schema.orders).where(eq(schema.orders.id, order.id)).limit(1);
  await getDb()
    .update(schema.orders)
    .set({ resolution: { ...((row?.resolution as object) ?? {}), settlement }, updatedAt: new Date() })
    .where(eq(schema.orders.id, order.id));
}

/** PayPal batch/item statuses → ours. Anything not final stays PENDING and is re-read by the sweep. */
function payoutStatus(batch: string, item?: string): Settlement["status"] {
  if (batch === "DENIED" || batch === "CANCELED") return "FAILED";
  if (item === "SUCCESS") return "SUCCESS";
  if (item === "UNCLAIMED") return "UNCLAIMED";
  if (item && ["FAILED", "RETURNED", "BLOCKED", "REVERSED", "REFUNDED"].includes(item)) return "FAILED";
  return "PENDING";
}

export async function settleAgentLiability(order: OrderRow, amount: string, attempt: number): Promise<Settlement> {
  const from = operatorName(order);
  const base = { amount, currency: order.currency, from, to: null as string | null, attempt, at: new Date().toISOString() };
  let settlement: Settlement;
  if (!operatorConfigured()) {
    settlement = { ...base, status: "NOT_CONFIGURED", error: "No agent-operator PayPal account is configured on this server." };
    await appendEvent(order.mandateId, "LIABILITY_UNSETTLED", { orderId: order.id, operator: from, amount: `${amount} ${order.currency}`, reason: settlement.error });
  } else {
    try {
      const pp = await paypal.getOrder(order.paypalOrderId!);
      const merchantId = pp.purchase_units?.[0]?.payee?.merchant_id;
      if (!merchantId) throw new Error("The PayPal order has no payee merchant id.");
      const batch = await payouts.settle({
        orderId: order.id,
        attempt,
        merchantPayPalId: merchantId,
        amount,
        currency: order.currency,
        note: `Undo: ${from} reimburses the refund on order ${order.id.slice(0, 8)}; its agent broke the shopper's signed mandate.`,
      });
      settlement = { ...base, to: merchantId, status: payoutStatus(batch.batch_header.batch_status), payoutBatchId: batch.batch_header.payout_batch_id };
      await appendEvent(order.mandateId, "LIABILITY_PAYOUT_SENT", { orderId: order.id, operator: from, to: merchantId, amount: `${amount} ${order.currency}`, payoutBatchId: settlement.payoutBatchId, attempt });
    } catch (err) {
      const error = err instanceof PayPalError ? err.message : err instanceof Error ? err.message : String(err);
      settlement = { ...base, status: "FAILED", error };
      await appendEvent(order.mandateId, "LIABILITY_PAYOUT_FAILED", { orderId: order.id, operator: from, amount: `${amount} ${order.currency}`, error, attempt });
    }
  }
  await saveSettlement(order, settlement);
  return settlement;
}

/** Re-reads payouts PayPal hasn't finished yet. Runs from the opportunistic sweep; safe to run concurrently. */
export async function refreshSettlements(limit = 5) {
  const pending = await getDb()
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.status, "REFUNDED"), sql`${schema.orders.resolution}->'settlement'->>'status' = 'PENDING'`))
    .limit(limit);
  for (const order of pending) {
    const s = (order.resolution as { settlement: Settlement }).settlement;
    if (!s.payoutBatchId) continue;
    try {
      const batch = await payouts.get(s.payoutBatchId);
      const item = batch.items?.[0];
      const status = payoutStatus(batch.batch_header.batch_status, item?.transaction_status);
      if (status === "PENDING") continue;
      const next: Settlement = { ...s, status, payoutItemId: item?.payout_item_id, transactionId: item?.transaction_id, ...(item?.errors ? { error: item.errors.message ?? item.errors.name } : {}) };
      await saveSettlement(order, next);
      await appendEvent(order.mandateId, status === "SUCCESS" ? "LIABILITY_SETTLED" : "LIABILITY_PAYOUT_FAILED", {
        orderId: order.id,
        operator: s.from,
        to: s.to,
        amount: `${s.amount} ${s.currency}`,
        payoutBatchId: s.payoutBatchId,
        transactionId: item?.transaction_id ?? null,
        status,
      });
    } catch (err) {
      console.error("settlement refresh failed:", err instanceof Error ? err.message : err);
    }
  }
}

/** Merchant console: send the operator's payout again after it failed or before an operator account existed. */
export async function retrySettlement(order: OrderRow) {
  const s = (order.resolution as { settlement?: Settlement } | null)?.settlement;
  if (order.status !== "REFUNDED" || !s || !["FAILED", "NOT_CONFIGURED"].includes(s.status)) throw new StaleOrder(order.id);
  // A denied batch needs a new batch id; a call that never reached PayPal can safely reuse the same one.
  return settleAgentLiability(order, s.amount, s.payoutBatchId ? s.attempt + 1 : s.attempt);
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
