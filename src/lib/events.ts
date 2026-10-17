/**
 * Hash-chained event store on Postgres. Every step of a purchase (mandate signed, cart proposed, payment
 * authorized, undo requested, refund issued…) is appended here; `chain()` re-verifies the whole history.
 */
import { asc, desc, eq } from "drizzle-orm";
import { getDb, pgError, schema } from "@/db";
import { chainNext, verifyChain, type ChainedEvent } from "./crypto";

const toChained = (r: typeof schema.events.$inferSelect): ChainedEvent => ({
  subjectId: r.subjectId,
  seq: r.seq,
  type: r.type,
  payload: r.payload,
  createdAt: r.createdAt,
  prevHash: r.prevHash,
  hash: r.hash,
});

export async function appendEvent(subjectId: string, type: string, payload: unknown): Promise<ChainedEvent> {
  const db = getDb();
  for (let attempt = 0; attempt < 3; attempt++) {
    const [last] = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.subjectId, subjectId))
      .orderBy(desc(schema.events.seq))
      .limit(1);
    const next = chainNext(last ? toChained(last) : null, {
      subjectId,
      type,
      payload: payload ?? {},
      createdAt: new Date().toISOString(),
    });
    try {
      await db.insert(schema.events).values(next);
      return next;
    } catch (err) {
      // Lost a race for this seq (unique index) — re-read the tip and try again.
      const { code, constraint } = pgError(err);
      if (attempt === 2 || code !== "23505" || constraint !== "events_subject_seq_uq") throw err;
    }
  }
  throw new Error("unreachable");
}

export async function chain(subjectId: string): Promise<{ events: ChainedEvent[]; intact: boolean; brokenAt: number }> {
  const rows = await getDb()
    .select()
    .from(schema.events)
    .where(eq(schema.events.subjectId, subjectId))
    .orderBy(asc(schema.events.seq));
  const events = rows.map(toChained);
  const brokenAt = verifyChain(events);
  return { events, intact: brokenAt === -1, brokenAt };
}
