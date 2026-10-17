import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { appendEvent } from "@/lib/events";
import { loadOrder, publicBaseUrl } from "@/lib/store";

/** GET /api/checkout/cancel?order=…&token=… — the shopper backed out in PayPal. No money ever moved. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const order = await loadOrder(url.searchParams.get("order") ?? "");
  if (!order || order.paypalOrderId !== url.searchParams.get("token")) {
    return NextResponse.json({ error: "unknown_checkout" }, { status: 404 });
  }
  if (order.status === "CHECKOUT_CREATED") {
    await getDb().update(schema.orders).set({ status: "CANCELLED", updatedAt: new Date() }).where(eq(schema.orders.id, order.id));
    await appendEvent(order.mandateId, "CHECKOUT_CANCELLED", { orderId: order.id, by: "shopper" });
  }
  return NextResponse.redirect(`${publicBaseUrl(req)}/orders/${order.id}`, 303);
}
