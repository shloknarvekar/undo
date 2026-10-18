import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { canonicalJson } from "@/lib/crypto";
import { IntentDraft, IntentMandate, prepareMandate, readyToSign, signingMessage } from "@/lib/mandate";
import { parseRequest, ParseError } from "@/lib/mandate-parser";
import { loadMandateRequest, storeSignedMandate } from "@/lib/store";

/**
 * The shopper's side of an agent's mandate request (the agent itself only ever gets the link).
 *   GET                         → the draft, who is asking, and whether it's signed yet
 *   POST { action: "answer" }   → answers the agent's open questions; the draft is re-read from the new text
 *   POST { action: "prepare" }  → the exact mandate this device's key must sign (built from the stored draft)
 *   POST { action: "sign" }     → stores the signed mandate; it must be byte-for-byte what was shown
 */
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const row = await loadMandateRequest((await params).id);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    id: row.id,
    request: row.request,
    draft: row.draft,
    ready: readyToSign(row.draft),
    agent: row.agent,
    status: row.status,
    mandateId: row.mandateId,
    expiresAt: row.expiresAt,
  });
}

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("answer"), answers: z.record(z.string().max(200), z.string().max(200)) }),
  z.object({ action: z.literal("prepare"), shopperKey: z.string().min(40).max(60) }),
  z.object({ action: z.literal("sign"), mandate: IntentMandate, signature: z.string().min(80).max(100) }),
]);

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  const row = await loadMandateRequest(id);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (row.status !== "PENDING") return NextResponse.json({ error: `request_${row.status.toLowerCase()}`, mandateId: row.mandateId }, { status: 409 });
  const body = parsed.data;
  const db = getDb();

  if (body.action === "answer") {
    const extra = row.draft.mustAsk
      .map((q) => (body.answers[q]?.trim() ? `${q.replace(/\?$/, "")}: ${body.answers[q].trim()}.` : ""))
      .filter(Boolean)
      .join(" ");
    if (!extra) return NextResponse.json({ error: "no_answers" }, { status: 400 });
    const request = `${row.request}. ${extra}`.slice(0, 1000);
    try {
      const draft = await parseRequest(request);
      await db.update(schema.mandateRequests).set({ request, draft }).where(eq(schema.mandateRequests.id, id));
      return NextResponse.json({ request, draft, ready: readyToSign(draft) });
    } catch (err) {
      if (err instanceof ParseError) return NextResponse.json({ error: "parser_unavailable" }, { status: 503 });
      return NextResponse.json({ error: "parse_failed" }, { status: 502 });
    }
  }

  if (body.action === "prepare") {
    const ready = readyToSign(row.draft);
    if (!ready.ok) return NextResponse.json({ error: ready.reason, mustAsk: row.draft.mustAsk }, { status: 422 });
    const mandate = prepareMandate(row.request, row.draft, body.shopperKey, new Date(), row.agent);
    return NextResponse.json({ mandate, signingMessage: signingMessage(mandate) });
  }

  // sign: the device can only sign what this request shows: same words, same limits, same named agent.
  const m = body.mandate;
  const same =
    m.request === row.request &&
    canonicalJson(IntentDraft.parse(m.intent)) === canonicalJson(row.draft) &&
    canonicalJson(m.agent ?? null) === canonicalJson(row.agent);
  if (!same) return NextResponse.json({ error: "mandate_does_not_match_request" }, { status: 422 });

  const stored = await storeSignedMandate(m, body.signature);
  if (!stored.ok) return NextResponse.json({ error: stored.error }, { status: stored.status });
  await db
    .update(schema.mandateRequests)
    .set({ status: "SIGNED", mandateId: m.id })
    .where(and(eq(schema.mandateRequests.id, id), eq(schema.mandateRequests.status, "PENDING")));
  return NextResponse.json({ mandateId: m.id, digest: stored.digest }, { status: 201 });
}
