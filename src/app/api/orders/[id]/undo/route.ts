import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifySignature } from "@/lib/crypto";
import { appendEvent } from "@/lib/events";
import { investigate } from "@/lib/fault";
import { undoSigningMessage } from "@/lib/fault-core";
import { executeUndo, StaleOrder } from "@/lib/money";
import { PayPalError } from "@/lib/paypal";
import { loadMandate, loadOrder } from "@/lib/store";
import { limitRoute } from "@/lib/usage";

/**
 * POST /api/orders/:id/undo { reason, photo?, requestedAt, signature }
 * The Undo button. Signed by the shopper's mandate key. Runs the fault engine, then the money router:
 * inside the window → void; after capture → refund / merchant claim / return / human review.
 */
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const Body = z.object({
  reason: z.string().min(3).max(500),
  photo: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, "photo must be a base64 JPEG/PNG/WebP data URL")
    .optional(),
  requestedAt: z.string().datetime(),
  signature: z.string().min(80).max(100),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const limited = limitRoute(req, "undo");
  if (limited) return limited;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  const { reason, photo, requestedAt, signature } = parsed.data;

  const order = await loadOrder(id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const loaded = await loadMandate(order.mandateId);
  if (!loaded) return NextResponse.json({ error: "mandate_unavailable" }, { status: 409 });

  let photoPart: { data: string; mediaType: string } | undefined;
  let photoSha256: string | null = null;
  if (photo) {
    const [header, b64] = photo.split(",");
    const bytes = Buffer.from(b64, "base64");
    if (bytes.length > MAX_PHOTO_BYTES) return NextResponse.json({ error: "photo_too_large", maxBytes: MAX_PHOTO_BYTES }, { status: 413 });
    photoSha256 = createHash("sha256").update(bytes).digest("hex");
    photoPart = { data: b64, mediaType: header.slice(5, header.indexOf(";")) };
  }

  if (Math.abs(Date.now() - Date.parse(requestedAt)) > 15 * 60_000) return NextResponse.json({ error: "stale_request" }, { status: 422 });
  if (!verifySignature(loaded.mandate.shopperKey, undoSigningMessage(order.id, reason, photoSha256, requestedAt), signature)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 403 });
  }
  if (!["AUTHORIZED", "CAPTURED"].includes(order.status)) {
    return NextResponse.json({ error: "not_undoable", status: order.status }, { status: 409 });
  }

  await appendEvent(order.mandateId, "UNDO_REQUESTED", { orderId: order.id, reason, photoSha256, requestedAt, signature, atStatus: order.status });

  try {
    const { findings, decision } = await investigate(loaded.mandate, order, { reason, photo: photoPart });
    await appendEvent(order.mandateId, "VERDICT", {
      orderId: order.id,
      verdict: decision.verdict,
      confidence: decision.confidence,
      liability: decision.liability,
      evidence: decision.evidence,
      ai: { intent: findings.intent, delivered: findings.delivered },
    });
    const outcome = await executeUndo(order, decision);
    return NextResponse.json({ orderId: order.id, decision, outcome });
  } catch (err) {
    if (err instanceof StaleOrder) return NextResponse.json({ error: "order_changed_retry" }, { status: 409 });
    const message = err instanceof PayPalError ? err.message : err instanceof Error ? err.message : String(err);
    await appendEvent(order.mandateId, "UNDO_FAILED", { orderId: order.id, error: message });
    console.error("undo failed:", message);
    return NextResponse.json({ error: "undo_failed", detail: message }, { status: 502 });
  }
}
