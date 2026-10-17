import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
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

    const window = order.risk as UndoWindow;
    const windowEndsAt = new Date(Date.now() + window.minutes * 60_000);
    await set({ status: "AUTHORIZED", authorizationId: auth.id, windowEndsAt });
    await appendEvent(order.mandateId, "PAYMENT_AUTHORIZED", {
      orderId: order.id,
      paypalOrderId: order.paypalOrderId,
      payerId: approved.payer?.payer_id ?? null,
      authorizationId: auth.id,
      amount: auth.amount,
      authorizationExpires: auth.expiration_time ?? null,
      undoWindowMinutes: window.minutes,
      windowEndsAt: windowEndsAt.toISOString(),
    });
    await db.update(schema.mandates).set({ status: "FULFILLED" }).where(eq(schema.mandates.id, order.mandateId));

    if (window.minutes === 0) {
      const capture = await paypal.captureAuthorization(auth.id);
      await set({ status: "CAPTURED", captureId: capture.id });
      await appendEvent(order.mandateId, "PAYMENT_CAPTURED", { orderId: order.id, captureId: capture.id, reason: "no undo window (low risk)" });
    }
    return done();
  } catch (err) {
    const message = err instanceof PayPalError ? err.message : err instanceof Error ? err.message : String(err);
    await set({ status: "FAILED" });
    await appendEvent(order.mandateId, "AUTHORIZATION_FAILED", { orderId: order.id, error: message });
    return NextResponse.json({ error: "authorization_failed", detail: message }, { status: 502 });
  }
}
