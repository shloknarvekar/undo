import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveByMerchant, StaleOrder } from "@/lib/money";
import { PayPalError } from "@/lib/paypal";
import { loadOrder } from "@/lib/store";

/**
 * POST /api/orders/:id/resolve { action: "accept_claim" | "return_received" } — the merchant's side of an Undo.
 * Sandbox only until the merchant console adds merchant sign-in.
 */
const Body = z.object({ action: z.enum(["accept_claim", "return_received"]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if ((process.env.PAYPAL_ENV ?? "sandbox") !== "sandbox") return NextResponse.json({ error: "sandbox_only" }, { status: 403 });
  const { id } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  const order = await loadOrder(id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  try {
    return NextResponse.json({ orderId: id, ...(await resolveByMerchant(order, parsed.data.action)) });
  } catch (err) {
    if (err instanceof StaleOrder) return NextResponse.json({ error: "wrong_state", status: order.status }, { status: 409 });
    return NextResponse.json({ error: "resolve_failed", detail: err instanceof PayPalError ? err.message : String(err) }, { status: 502 });
  }
}
