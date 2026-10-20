import { NextResponse } from "next/server";
import { createHandoff } from "@/lib/handoff";
import { publicBaseUrl, UUID } from "@/lib/store";
import { limitRoute } from "@/lib/usage";

/**
 * POST /api/orders/:id/photo-handoff → a one-time, 15-minute link (and its QR code) for the shopper's phone to send a
 * photo of what arrived. The phone can only hand over a photo; the undo itself is still signed on this computer.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const limited = limitRoute(req, "photo");
  if (limited) return limited;
  const h = await createHandoff(id, publicBaseUrl(req));
  if ("error" in h) return NextResponse.json({ error: h.error }, { status: h.error === "not_found" ? 404 : 409 });
  return NextResponse.json(h, { status: 201, headers: { "Cache-Control": "no-store" } });
}
