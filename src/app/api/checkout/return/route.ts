import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { recordAuthorization } from "@/lib/checkout";
import { appendEvent } from "@/lib/events";
import { paypal, PayPalError } from "@/lib/paypal";
import { loadOrder, publicBaseUrl } from "@/lib/store";
import type { UndoWindow } from "@/lib/agent-core";

/**
 * GET /api/checkout/return?order=<undo order>&token=<paypal order>&PayerID=…
 * PayPal sends the shopper here after they approve. We authorize (hold, don't take) the money and open the
 * undo window. A 0-minute window (cheap and certain) is captured straight away. Safe to hit twice.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order") ?? "";
  const token = url.searchParams.get("token") ?? "";
  const done = () => NextResponse.redirect(`${publicBaseUrl(req)}/orders/${orderId}`, 303);

  const order = await loadOrder(orderId);
  if (!order || !order.paypalOrderId || order.paypalOrderId !== token) {
    return NextResponse.json({ error: "unknown_checkout" }, { status: 404 });
  }
  if (order.status !== "CHECKOUT_CREATED") return done(); // already handled (refresh / back button)

  const db = getDb();
  const set = (values: Partial<typeof schema.orders.$inferInsert>) =>
    db.update(schema.orders).set({ ...values, updatedAt: new Date() }).where(eq(schema.orders.id, order.id));

  try {
    const approved = await paypal.getOrder(order.paypalOrderId);
    if (approved.status !== "APPROVED" && approved.status !== "COMPLETED") {
      return NextResponse.json({ error: "not_approved", paypalStatus: approved.status }, { status: 409 });
    }
    const authorized = await paypal.authorizeOrder(order.paypalOrderId);
    const auth = authorized.purchase_units?.[0]?.payments?.authorizations?.[0];
    if (!auth) throw new Error("PayPal returned no authorization");
    await recordAuthorization({
      orderId: order.id,
      mandateId: order.mandateId,
      paypalOrderId: order.paypalOrderId,
      window: order.risk as UndoWindow,
      auth,
      payerId: approved.payer?.payer_id ?? null,
    });
    return done();
  } catch (err) {
    const message = err instanceof PayPalError ? err.message : err instanceof Error ? err.message : String(err);
    await set({ status: "FAILED" });
    await appendEvent(order.mandateId, "AUTHORIZATION_FAILED", { orderId: order.id, error: message });
    return NextResponse.json({ error: "authorization_failed", detail: message }, { status: 502 });
  }
}
