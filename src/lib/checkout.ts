/**
 * Opening a purchase: the one path every agent goes through, Undo's own web agent and outside agents via MCP.
 * Writes the order row, the CART_PROPOSED event, and a PayPal checkout in AUTHORIZE mode (money held, not taken).
 */
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { UndoWindow } from "./agent-core";
import type { StoreProduct } from "./channel3";
import { appendEvent } from "./events";
import { approveLink, paypal, PayPalError } from "./paypal";

export class CheckoutFailed extends Error {}

/** One live purchase per mandate: returns the open order id, if any. */
export async function openOrderFor(mandateId: string): Promise<string | null> {
  const [open] = await getDb()
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(and(eq(schema.orders.mandateId, mandateId), inArray(schema.orders.status, ["CHECKOUT_CREATED", "AUTHORIZED", "CAPTURED"])))
    .limit(1);
  return open?.id ?? null;
}

export async function openCheckout(input: {
  mandateId: string;
  product: StoreProduct;
  quantity: number;
  /** Stored on the order as-is: reasoning, confidence, guard result, and who the agent was. */
  agent: Record<string, unknown>;
  window: UndoWindow;
  baseUrl: string;
}): Promise<{ orderId: string; approveUrl: string; amount: string }> {
  const { mandateId, product, quantity, agent, window, baseUrl } = input;
  const db = getDb();
  const unitPrice = product.price.toFixed(2);
  const amount = (Number(unitPrice) * quantity).toFixed(2);
  const orderId = randomUUID();

  await db.insert(schema.orders).values({ id: orderId, mandateId, status: "CHECKOUT_CREATED", amount, currency: product.currency, quantity, product, agent, risk: window });
  await appendEvent(mandateId, "CART_PROPOSED", { orderId, product, quantity, agent, risk: window });

  try {
    const order = await paypal.createAgentOrder({
      undoOrderId: orderId,
      item: {
        name: product.title,
        sku: product.channel3Id,
        quantity,
        unitPrice,
        currency: product.currency,
        url: product.sourceUrl,
        imageUrl: product.imageUrl ?? undefined,
      },
      returnUrl: `${baseUrl}/api/checkout/return?order=${orderId}`,
      cancelUrl: `${baseUrl}/api/checkout/cancel?order=${orderId}`,
    });
    const approveUrl = approveLink(order);
    if (!approveUrl) throw new Error(`PayPal order ${order.id} has no approval link`);
    await db.update(schema.orders).set({ paypalOrderId: order.id, updatedAt: new Date() }).where(eq(schema.orders.id, orderId));
    await appendEvent(mandateId, "CHECKOUT_CREATED", { orderId, paypalOrderId: order.id, intent: "AUTHORIZE", amount, currency: product.currency });
    return { orderId, approveUrl, amount };
  } catch (err) {
    await db.update(schema.orders).set({ status: "FAILED", updatedAt: new Date() }).where(eq(schema.orders.id, orderId));
    await appendEvent(mandateId, "CHECKOUT_FAILED", { orderId, error: err instanceof PayPalError ? err.message : String(err) });
    throw new CheckoutFailed(err instanceof PayPalError ? err.message : "PayPal checkout failed");
  }
}
