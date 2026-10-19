import { eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { appCache, usageCounters } from "@/db/schema";

/**
 * Usage limits for everything that spends free-tier quota: Gemini (drafting mandates, the agent's pick, fault checks)
 * and Channel3 search (1,000 credits a month). Two layers:
 *  - per visitor, in memory: a sliding window per endpoint, so one person can't hammer a button;
 *  - global, in Postgres: day and month budgets per paid API. They survive restarts (Render's free tier sleeps), so the
 *    monthly credits can't be drained by anyone, whatever address they come from.
 * Free calls (Channel3 product detail, the PayPal sandbox) are not counted.
 */

export class QuotaExceeded extends Error {
  constructor(
    message: string,
    public retryAfterSec: number,
  ) {
    super(message);
  }
}

// ── Per visitor ────────────────────────────────────────────────────────────────────────────────

type Window = { max: number; ms: number };
const MIN = 60_000;
const HOUR = 60 * MIN;

export const ROUTE_LIMITS = {
  draft: [{ max: 6, ms: MIN }, { max: 30, ms: HOUR }], // turning words into a mandate (Gemini)
  shop: [{ max: 4, ms: MIN }, { max: 20, ms: HOUR }], // Undo's own agent shopping (Channel3 + Gemini)
  rogue: [{ max: 4, ms: MIN }, { max: 20, ms: HOUR }], // the rogue-agents demo (Channel3)
  search: [{ max: 10, ms: MIN }, { max: 60, ms: HOUR }], // raw product search (Channel3)
  undo: [{ max: 6, ms: MIN }, { max: 30, ms: HOUR }], // fault checks (Gemini, photos included)
  mcp: [{ max: 60, ms: MIN }, { max: 600, ms: HOUR }], // outside agents; tool calls are chatty, budgets still apply
} satisfies Record<string, Window[]>;
export type RouteLimit = keyof typeof ROUTE_LIMITS;

/**
 * Sliding-window check over the given windows. Records the hit only when it is allowed.
 * Returns 0 when allowed, otherwise the seconds until the oldest blocking hit leaves its window.
 */
export function slidingWindow(store: Map<string, number[]>, key: string, windows: Window[], now = Date.now()): number {
  const longest = Math.max(...windows.map((w) => w.ms));
  const recent = (store.get(key) ?? []).filter((t) => now - t < longest);
  let wait = 0;
  for (const w of windows) {
    const inWindow = recent.filter((t) => now - t < w.ms);
    if (inWindow.length >= w.max) wait = Math.max(wait, Math.ceil((inWindow[inWindow.length - w.max] + w.ms - now) / 1000));
  }
  if (!wait) recent.push(now);
  store.set(key, recent);
  if (store.size > 5_000) for (const [k, ts] of store) if (!ts.some((t) => now - t < longest)) store.delete(k);
  return wait;
}

/** The visitor's address as the hosting proxy reports it (Cloudflare's header first: clients can't set it). */
export function visitorId(req: Request): string {
  const h = req.headers;
  return h.get("cf-connecting-ip") ?? h.get("true-client-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

const hits = new Map<string, number[]>();

/** 429 response when this visitor is over the endpoint's limit, otherwise null. */
export function limitRoute(req: Request, route: RouteLimit): NextResponse | null {
  const wait = slidingWindow(hits, `${route}:${visitorId(req)}`, ROUTE_LIMITS[route]);
  return wait ? tooMany(`That's a lot of tries in a short time. Give it ${humanWait(wait)} and try again.`, wait) : null;
}

export function tooMany(detail: string, retryAfterSec: number) {
  return NextResponse.json(
    { error: "rate_limited", detail, retryAfter: retryAfterSec },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}

export const quotaResponse = (err: QuotaExceeded) => tooMany(err.message, err.retryAfterSec);

export function humanWait(sec: number): string {
  const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  if (sec < 60) return unit(sec, "second");
  if (sec < 3_600) return unit(Math.ceil(sec / 60), "minute");
  return unit(Math.ceil(sec / 3_600), "hour");
}

// ── Global budgets ─────────────────────────────────────────────────────────────────────────────

/** Free-tier ceilings with headroom. Gemini flash-lite: ~15 requests/min, ~1,000/day. Channel3: 1,000 credits/month. */
const BUDGETS = {
  gemini: { perMinute: 12, perDay: 800, label: "Undo's AI" },
  channel3: { perDay: 60, perMonth: 900, label: "The live product catalog" },
} as const;
export type Resource = keyof typeof BUDGETS;

const minuteHits = new Map<string, number[]>();

/** Seconds until the next UTC midnight or first of the month: when the day and month budgets reset. */
function untilNext(period: "day" | "month", now: Date): number {
  const next =
    period === "day"
      ? Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
      : Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

/**
 * Counts one call against a paid API's budgets, or throws QuotaExceeded when a budget is used up.
 * If the database can't be reached the call is allowed (and logged): the app is down anyway in that case.
 */
export async function spend(resource: Resource): Promise<void> {
  const b = BUDGETS[resource];
  if ("perMinute" in b) {
    const wait = slidingWindow(minuteHits, resource, [{ max: b.perMinute, ms: MIN }]);
    if (wait) throw new QuotaExceeded(`${b.label} is busy right now. Try again in ${humanWait(wait)}.`, wait);
  }
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const periods: { key: string; cap: number; period: "day" | "month" }[] = [{ key: `${resource}:${day}`, cap: b.perDay, period: "day" }];
  if ("perMonth" in b) periods.push({ key: `${resource}:${day.slice(0, 7)}`, cap: b.perMonth, period: "month" });

  let counts: { key: string; count: number }[];
  try {
    counts = await getDb()
      .insert(usageCounters)
      .values(periods.map((p) => ({ key: p.key, count: 1 })))
      .onConflictDoUpdate({ target: usageCounters.key, set: { count: sql`${usageCounters.count} + 1`, updatedAt: sql`now()` } })
      .returning({ key: usageCounters.key, count: usageCounters.count });
  } catch (err) {
    console.error(`usage counter for ${resource} unavailable:`, err instanceof Error ? err.message : err);
    return;
  }
  for (const p of periods) {
    const used = counts.find((c) => c.key === p.key)?.count ?? 0;
    if (used > p.cap) {
      const wait = untilNext(p.period, now);
      throw new QuotaExceeded(
        `${b.label} has used its free ${p.period === "day" ? "daily" : "monthly"} allowance for this demo. It resets in ${humanWait(wait)}; ` +
          "the finished cases and the rest of the site still work.",
        wait,
      );
    }
  }
}

/** Today's and this month's counts with their caps, for the health check. */
export async function usageNow(): Promise<Record<string, { used: number; cap: number }>> {
  const day = new Date().toISOString().slice(0, 10);
  const wanted = (Object.entries(BUDGETS) as [Resource, (typeof BUDGETS)[Resource]][]).flatMap(([r, b]) => [
    { key: `${r}:${day}`, cap: b.perDay },
    ...("perMonth" in b ? [{ key: `${r}:${day.slice(0, 7)}`, cap: b.perMonth }] : []),
  ]);
  const rows = await getDb().select().from(usageCounters).where(inArray(usageCounters.key, wanted.map((w) => w.key)));
  return Object.fromEntries(wanted.map((w) => [w.key, { used: rows.find((r) => r.key === w.key)?.count ?? 0, cap: w.cap }]));
}

// ── Durable cache ──────────────────────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<{ value: T; at: Date } | null> {
  try {
    const [row] = await getDb().select().from(appCache).where(eq(appCache.key, key)).limit(1);
    return row ? { value: row.value as T, at: row.at } : null;
  } catch (err) {
    console.error("app cache read failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function cachePut(key: string, value: unknown): Promise<void> {
  try {
    const at = new Date();
    await getDb().insert(appCache).values({ key, value, at }).onConflictDoUpdate({ target: appCache.key, set: { value, at } });
  } catch (err) {
    console.error("app cache write failed:", err instanceof Error ? err.message : err);
  }
}
