import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { chain } from "@/lib/events";
import { UUID, loadOrder } from "@/lib/store";

/**
 * GET /api/orders/:id/evidence → everything needed to check an order without trusting Undo: the raw hash-chained events
 * (exactly as hashed) and the signed mandate exactly as stored. The order page verifies it in the browser
 * (lib/verify.ts); anyone can download it and check it with their own tools. Nothing is pre-verified here on purpose.
 * Read-only; payloads hold PayPal ids and Undo's own records, no personal data.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const order = await loadOrder(id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const [[mandateRow], history] = await Promise.all([
    getDb().select({ mandate: schema.mandates.mandate }).from(schema.mandates).where(eq(schema.mandates.id, order.mandateId)).limit(1),
    chain(order.mandateId),
  ]);
  return NextResponse.json(
    { format: "undo-evidence-v1", orderId: order.id, mandate: mandateRow?.mandate ?? null, events: history.events },
    { headers: { "Cache-Control": "no-store", "Content-Disposition": `inline; filename="undo-evidence-${order.id}.json"` } },
  );
}
