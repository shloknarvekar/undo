import { NextResponse } from "next/server";
import { z } from "zod";
import { readyToSign } from "@/lib/mandate";
import { parseRequest, ParseError } from "@/lib/mandate-parser";

/** POST /api/mandates/draft { request } → structured draft for the shopper to review. Nothing is stored. */
const Body = z.object({ request: z.string().min(3).max(1000) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  try {
    const draft = await parseRequest(parsed.data.request);
    return NextResponse.json({ draft, ready: readyToSign(draft) });
  } catch (err) {
    if (err instanceof ParseError) return NextResponse.json({ error: "parser_unavailable", detail: err.message }, { status: 503 });
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }
}
