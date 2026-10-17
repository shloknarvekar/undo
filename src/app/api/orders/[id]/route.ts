import { NextResponse } from "next/server";
import { chain } from "@/lib/events";
import { maybeSweep } from "@/lib/money";
import { loadMandate, loadOrder } from "@/lib/store";

/** GET /api/orders/:id → the purchase, the live undo window, and the mandate's verified event chain. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  maybeSweep();
  const order = await loadOrder(id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const [loaded, history] = await Promise.all([loadMandate(order.mandateId), chain(order.mandateId)]);

  const msLeft = order.windowEndsAt ? order.windowEndsAt.getTime() - Date.now() : null;
  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      quantity: order.quantity,
      product: order.product,
      agent: order.agent,
      paypal: { orderId: order.paypalOrderId, authorizationId: order.authorizationId, captureId: order.captureId },
      resolution: order.resolution,
    },
    undoWindow: {
      ...(order.risk as object),
      endsAt: order.windowEndsAt?.toISOString() ?? null,
      open: order.status === "AUTHORIZED" && msLeft !== null && msLeft > 0,
      minutesLeft: msLeft !== null ? Math.max(0, Math.round(msLeft / 60_000)) : null,
    },
    mandate: loaded ? { id: loaded.mandate.id, request: loaded.mandate.request, intent: loaded.mandate.intent, status: loaded.status, shopperKey: loaded.mandate.shopperKey } : null,
    chain: { intact: history.intact, events: history.events.map(({ seq, type, createdAt, hash }) => ({ seq, type, createdAt, hash })) },
  });
}
