import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { canonicalJson, sha256Hex, verifySignature } from "@/lib/crypto";
import { chain } from "@/lib/events";
import { IntentMandate, mandateToSearch, signingMessage } from "@/lib/mandate";

/**
 * GET /api/mandates/:id → the mandate, its status, the search it permits, and a fresh integrity check:
 * stored digest vs recomputed, shopper signature, and the full event hash chain.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [row] = await getDb().select().from(schema.mandates).where(eq(schema.mandates.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const mandate = IntentMandate.parse(row.mandate);
  const history = await chain(id);
  const integrity = {
    digestMatches: sha256Hex(canonicalJson(mandate)) === row.digest,
    signatureValid: verifySignature(mandate.shopperKey, signingMessage(mandate), row.signature),
    chainIntact: history.intact,
    ...(history.intact ? {} : { chainBrokenAt: history.brokenAt }),
  };

  return NextResponse.json({
    mandate,
    status: Date.parse(mandate.expiresAt) <= Date.now() && row.status === "ACTIVE" ? "EXPIRED" : row.status,
    search: mandateToSearch(mandate),
    integrity,
    events: history.events.map(({ seq, type, createdAt, hash }) => ({ seq, type, createdAt, hash })),
  });
}
