import { NextResponse } from "next/server";
import { z } from "zod";
import { IntentDraft, prepareMandate, readyToSign, signingMessage } from "@/lib/mandate";

/**
 * POST /api/mandates/prepare { request, draft, shopperKey } → { mandate, signingMessage }
 * Builds the exact mandate the shopper's device signs. Stateless: POST /api/mandates re-verifies everything.
 */
const Body = z.object({
  request: z.string().min(3).max(1000),
  draft: IntentDraft,
  shopperKey: z.string().min(40).max(60),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  const { request, draft, shopperKey } = parsed.data;
  const ready = readyToSign(draft);
  if (!ready.ok) return NextResponse.json({ error: ready.reason, mustAsk: draft.mustAsk }, { status: 422 });
  const mandate = prepareMandate(request, draft, shopperKey);
  return NextResponse.json({ mandate, signingMessage: signingMessage(mandate) });
}
