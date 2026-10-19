import { NextResponse } from "next/server";
import { z } from "zod";
import { readyToSign } from "@/lib/mandate";
import { parseRequest, ParseError } from "@/lib/mandate-parser";
import { QuotaExceeded, limitRoute, quotaResponse } from "@/lib/usage";

/** POST /api/mandates/draft { request } → structured draft for the shopper to review. Nothing is stored. */
const Body = z.object({ request: z.string().min(3).max(1000) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  const limited = limitRoute(req, "draft");
  if (limited) return limited;
  try {
    const draft = await parseRequest(parsed.data.request);
    return NextResponse.json({ draft, ready: readyToSign(draft) });
  } catch (err) {
    if (err instanceof QuotaExceeded) return quotaResponse(err);
    if (err instanceof ParseError) return NextResponse.json({ error: "parser_unavailable", detail: err.message }, { status: 503 });
    console.error("mandate draft parse failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }
}
