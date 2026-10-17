import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { appendEvent } from "@/lib/events";
import { IntentMandate, verifyMandate } from "@/lib/mandate";

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

  const check = verifyMandate(mandate, signature);
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 422 });

  const inserted = await getDb()
    .insert(schema.mandates)
    .values({
      id: mandate.id,
      shopperKey: mandate.shopperKey,
      mandate,
      digest: check.digest,
      signature,
      expiresAt: new Date(mandate.expiresAt),
    })
    .onConflictDoNothing()
    .returning({ id: schema.mandates.id });
  if (!inserted.length) return NextResponse.json({ error: "mandate_exists" }, { status: 409 });

  const event = await appendEvent(mandate.id, "MANDATE_SIGNED", { digest: check.digest, signature });
  return NextResponse.json({ id: mandate.id, digest: check.digest, event: { seq: event.seq, hash: event.hash } }, { status: 201 });
}
