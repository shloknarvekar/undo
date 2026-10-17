import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { appendEvent } from "@/lib/events";
import { captureOrder } from "@/lib/money";
import { loadOrder } from "@/lib/store";

/**
 * POST /api/orders/:id/expire-window — demo time-warp (sandbox only): close the undo window now and let the
 * scheduler capture, so the after-capture Undo paths can be shown without waiting hours.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if ((process.env.PAYPAL_ENV ?? "sandbox") !== "sandbox") return NextResponse.json({ error: "sandbox_only" }, { status: 403 });
  const { id } = await params;
  const order = await loadOrder(id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (order.status !== "AUTHORIZED") return NextResponse.json({ error: "not_authorized", status: order.status }, { status: 409 });

  const now = new Date();
  await getDb().update(schema.orders).set({ windowEndsAt: now, updatedAt: now }).where(eq(schema.orders.id, id));
  await appendEvent(order.mandateId, "WINDOW_FAST_FORWARDED", { orderId: id, by: "demo", windowEndsAt: now.toISOString() });
  const captureId = await captureOrder({ ...order, windowEndsAt: now }, "undo window closed (demo fast-forward)");
  return NextResponse.json({ orderId: id, status: "CAPTURED", captureId });
}
