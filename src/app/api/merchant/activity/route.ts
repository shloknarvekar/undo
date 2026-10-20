import { desc, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { proofFor } from "@/lib/proof";

/**
 * GET /api/merchant/activity?after=<event id> → the store's live activity: every step Undo records (carts, holds,
 * voids, refunds, verdicts, payouts, blocked agents), newest first, straight from the hash-chained event log.
 * With `after`, only newer events, so the console can stream them into its grid. Sandbox demo store; no sign-in.
 */
const LIMIT = 60;

type Payload = {
  orderId?: string;
  amount?: string | { value?: string; currency_code?: string };
  operator?: { name?: string };
  agent?: { operator?: { name?: string } };
};

function amountOf(p: Payload): number | null {
  const a = p.amount;
  const v = typeof a === "string" ? a.split(" ")[0] : a?.value;
  const n = v === undefined ? NaN : Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  const after = Number(new URL(req.url).searchParams.get("after") ?? 0);
  const rows = await getDb()
    .select({ id: schema.events.id, type: schema.events.type, payload: schema.events.payload, createdAt: schema.events.createdAt, subjectId: schema.events.subjectId })
    .from(schema.events)
    .where(Number.isInteger(after) && after > 0 ? gt(schema.events.id, after) : undefined)
    .orderBy(desc(schema.events.id))
    .limit(LIMIT);

  const events = rows
    .filter((r) => !r.subjectId.startsWith("wallet:")) // a shopper's wallet history is theirs, not the store's
    .map((r) => {
      const p = (r.payload ?? {}) as Payload;
      const proof = proofFor(r.type, r.payload);
      return {
        id: r.id,
        at: r.createdAt,
        type: r.type,
        kind: proof.kind,
        how: proof.how,
        orderId: p.orderId ?? null,
        amount: amountOf(p),
        agent: p.operator?.name ?? p.agent?.operator?.name ?? null,
        ref: proof.ref ?? null,
      };
    });
  return NextResponse.json({ events }, { headers: { "Cache-Control": "no-store" } });
}
