/**
 * Opening a purchase: the one path every agent goes through, Undo's own web agent and outside agents via MCP.
 * Writes the order row, the CART_PROPOSED event, and a PayPal order in AUTHORIZE mode (money held, not taken).
 *
 * Two ways to pay, both ending in an authorization with an undo window:
 *   - approve: the shopper approves in PayPal; /api/checkout/return authorizes when they come back;
 *   - saved_wallet: the mandate the shopper signed says the agent may pay with the wallet this device saved
 *     (lib/wallet.ts); PayPal authorizes in the same call, with no redirect.
 */
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { UndoWindow } from "./agent-core";
import type { StoreProduct } from "./channel3";
import { appendEvent } from "./events";
import type { IntentMandate } from "./mandate";
import { approveLink, paypal, PayPalError, type Authorization } from "./paypal";
import { activeWallet } from "./wallet";

export class CheckoutFailed extends Error {}

export type Payment = { kind: "approve"; note?: "no_saved_wallet" } | { kind: "saved_wallet"; vaultId: string };

/**
 * How this purchase will be paid. The saved wallet is used only when the signed mandate asks for it AND this
 * shopper's device has an active saved wallet; otherwise the shopper approves in PayPal as usual.
 */
export async function paymentFor(mandate: IntentMandate): Promise<Payment> {
  if (mandate.payWith !== "saved_wallet") return { kind: "approve" };
  const wallet = await activeWallet(mandate.shopperKey);
  return wallet ? { kind: "saved_wallet", vaultId: wallet.vaultId } : { kind: "approve", note: "no_saved_wallet" };
}

/** One live purchase per mandate: returns the open order id, if any. */
export async function openOrderFor(mandateId: string): Promise<string | null> {
  const [open] = await getDb()
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(and(eq(schema.orders.mandateId, mandateId), inArray(schema.orders.status, ["CHECKOUT_CREATED", "AUTHORIZED", "CAPTURED"])))
    .limit(1);
  return open?.id ?? null;
}

/**
 * Money is held: mark the order AUTHORIZED, open the undo window, record it in the chain, and fulfil the mandate.
 * A 0-minute window (cheap and certain, never an autopay) is captured straight away. Shared by both ways to pay.
 */
export async function recordAuthorization(o: {
  orderId: string;
  mandateId: string;
  paypalOrderId: string;
  window: UndoWindow;
  auth: Authorization;
  payerId: string | null;
  autopay?: boolean;
}): Promise<{ status: "AUTHORIZED" | "CAPTURED"; windowEndsAt: Date }> {
  const db = getDb();
  const set = (values: Partial<typeof schema.orders.$inferInsert>) =>
    db.update(schema.orders).set({ ...values, updatedAt: new Date() }).where(eq(schema.orders.id, o.orderId));
  const windowEndsAt = new Date(Date.now() + o.window.minutes * 60_000);
  await set({ status: "AUTHORIZED", authorizationId: o.auth.id, windowEndsAt });
  await appendEvent(o.mandateId, "PAYMENT_AUTHORIZED", {
    orderId: o.orderId,
    paypalOrderId: o.paypalOrderId,
    payerId: o.payerId,
    authorizationId: o.auth.id,
    amount: o.auth.amount,
    authorizationExpires: o.auth.expiration_time ?? null,
    undoWindowMinutes: o.window.minutes,
    windowEndsAt: windowEndsAt.toISOString(),
    ...(o.autopay ? { paidWith: "saved_wallet" } : {}),
  });
  await db.update(schema.mandates).set({ status: "FULFILLED" }).where(eq(schema.mandates.id, o.mandateId));

  if (o.window.minutes === 0) {
    const capture = await paypal.captureAuthorization(o.auth.id);
    await set({ status: "CAPTURED", captureId: capture.id });
    await appendEvent(o.mandateId, "PAYMENT_CAPTURED", { orderId: o.orderId, captureId: capture.id, reason: "no undo window (low risk)" });
    return { status: "CAPTURED", windowEndsAt };
  }
  return { status: "AUTHORIZED", windowEndsAt };
}

export async function openCheckout(input: {
  mandateId: string;
  product: StoreProduct;
  quantity: number;
  /** Stored on the order as-is: reasoning, confidence, guard result, and who the agent was. */
  agent: Record<string, unknown>;
  window: UndoWindow;
  baseUrl: string;
  pay: Payment;
}): Promise<{
  orderId: string;
  amount: string;
  /** Where the shopper approves the payment; null when the saved wallet already paid. */
  approveUrl: string | null;
  status: "CHECKOUT_CREATED" | "AUTHORIZED" | "CAPTURED";
  windowEndsAt: string | null;
}> {
  const { mandateId, product, quantity, agent, window, baseUrl, pay } = input;
  const db = getDb();
  const unitPrice = product.price.toFixed(2);
  const amount = (Number(unitPrice) * quantity).toFixed(2);
  const orderId = randomUUID();
  const item = {
    name: product.title,
    sku: product.channel3Id,
    quantity,
    unitPrice,
    currency: product.currency,
    url: product.sourceUrl,
    imageUrl: product.imageUrl ?? undefined,
  };

  await db.insert(schema.orders).values({ id: orderId, mandateId, status: "CHECKOUT_CREATED", amount, currency: product.currency, quantity, product, agent, risk: window });
  await appendEvent(mandateId, "CART_PROPOSED", { orderId, product, quantity, agent, risk: window });

  try {
    if (pay.kind === "saved_wallet") {
      const order = await paypal.createAgentOrder({ undoOrderId: orderId, item, pay: { vaultId: pay.vaultId } });
      await db.update(schema.orders).set({ paypalOrderId: order.id, updatedAt: new Date() }).where(eq(schema.orders.id, orderId));
      await appendEvent(mandateId, "CHECKOUT_CREATED", { orderId, paypalOrderId: order.id, intent: "AUTHORIZE", amount, currency: product.currency, paidWith: "saved_wallet" });
      const auth = order.purchase_units?.[0]?.payments?.authorizations?.[0];
      if (order.status !== "COMPLETED" || !auth) throw new Error(`PayPal didn't authorize the saved wallet (order ${order.id} is ${order.status})`);
      const done = await recordAuthorization({ orderId, mandateId, paypalOrderId: order.id, window, auth, payerId: order.payer?.payer_id ?? null, autopay: true });
      return { orderId, amount, approveUrl: null, status: done.status, windowEndsAt: done.windowEndsAt.toISOString() };
    }

    const order = await paypal.createAgentOrder({
      undoOrderId: orderId,
      item,
      pay: { returnUrl: `${baseUrl}/api/checkout/return?order=${orderId}`, cancelUrl: `${baseUrl}/api/checkout/cancel?order=${orderId}` },
    });
    const approveUrl = approveLink(order);
    if (!approveUrl) throw new Error(`PayPal order ${order.id} has no approval link`);
    await db.update(schema.orders).set({ paypalOrderId: order.id, updatedAt: new Date() }).where(eq(schema.orders.id, orderId));
    await appendEvent(mandateId, "CHECKOUT_CREATED", { orderId, paypalOrderId: order.id, intent: "AUTHORIZE", amount, currency: product.currency });
    return { orderId, amount, approveUrl, status: "CHECKOUT_CREATED", windowEndsAt: null };
  } catch (err) {
    await db.update(schema.orders).set({ status: "FAILED", updatedAt: new Date() }).where(eq(schema.orders.id, orderId));
    await appendEvent(mandateId, "CHECKOUT_FAILED", { orderId, error: err instanceof PayPalError ? err.message : String(err) });
    throw new CheckoutFailed(err instanceof PayPalError ? err.message : err instanceof Error ? err.message : "PayPal checkout failed");
  }
}
