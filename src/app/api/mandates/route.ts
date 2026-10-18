import { NextResponse } from "next/server";
import { z } from "zod";
import { IntentMandate } from "@/lib/mandate";
import { storeSignedMandate } from "@/lib/store";

/**
 * POST /api/mandates { mandate, signature } → stores a shopper-signed mandate.
 * The server never trusts the client's copy: signature, freshness, expiry and readiness are all re-checked,
 * then the first event of the mandate's hash chain (MANDATE_SIGNED) is written.
 */
const Body = z.object({ mandate: IntentMandate, signature: z.string().min(80).max(100) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  const { mandate, signature } = parsed.data;

  const stored = await storeSignedMandate(mandate, signature);
  if (!stored.ok) return NextResponse.json({ error: stored.error }, { status: stored.status });
  return NextResponse.json({ id: mandate.id, digest: stored.digest, event: { seq: stored.event.seq, hash: stored.event.hash } }, { status: 201 });
}
