import { NextResponse } from "next/server";
import { z } from "zod";
import { collectPhoto, receivePhoto, type HandoffError } from "@/lib/handoff";
import { UUID } from "@/lib/store";
import { limitRoute } from "@/lib/usage";

/**
 * GET  /api/orders/:id/photo-handoff/:token → "waiting", or the photo once the phone has sent it (collected once).
 * POST /api/orders/:id/photo-handoff/:token { photo } → the phone sends its photo (a JPEG/PNG/WebP data URL, ≤ 4 MB).
 */
type Ctx = { params: Promise<{ id: string; token: string }> };
const STATUS: Record<HandoffError, number> = { not_found: 404, not_undoable: 409, expired: 410, already_sent: 409, bad_photo: 400, photo_too_large: 413 };
const valid = (id: string, token: string) => UUID.test(id) && /^[A-Za-z0-9_-]{20,64}$/.test(token);

export async function GET(_req: Request, { params }: Ctx) {
  const { id, token } = await params;
  if (!valid(id, token)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const r = await collectPhoto(id, token);
  if ("error" in r) return NextResponse.json(r, { status: STATUS[r.error] });
  return NextResponse.json(r, { headers: { "Cache-Control": "no-store" } });
}

const Body = z.object({ photo: z.string().max(6_000_000) });

export async function POST(req: Request, { params }: Ctx) {
  const { id, token } = await params;
  if (!valid(id, token)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const limited = limitRoute(req, "photo");
  if (limited) return limited;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_photo" }, { status: 400 });
  const r = await receivePhoto(id, token, parsed.data.photo);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: STATUS[r.error] });
  return NextResponse.json({ ok: true });
}
