import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { databaseUrl, getDb } from "@/db";
import { maybeSweep } from "@/lib/money";
import { catalog } from "@/lib/paypal";

/**
 * GET /api/health — Render's health check (shallow, no external calls) and a deploy smoke test.
 * GET /api/health?deep=1 — also proves the deployed service can reach PayPal sandbox with its env credentials.
 * Never returns secret values, only whether each one is configured.
 * (Reading the request keeps this handler dynamic; no segment config needed with cacheComponents.)
 */

export async function GET(req: Request) {
  maybeSweep(); // undo-window scheduler rides on health-check/keepalive traffic (free host, no cron)
  const configured = {
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    channel3: Boolean(process.env.CHANNEL3_API_KEY),
    database: Boolean(process.env.DATABASE_URL),
  };
  const body: Record<string, unknown> = {
    ok: true,
    service: "undo",
    commit: process.env.RENDER_GIT_COMMIT?.slice(0, 7) ?? "local",
    configured,
  };

  const deep = new URL(req.url).searchParams.has("deep");
  if (deep && configured.paypal) {
    try {
      // Cheap authenticated call: fails fast on bad credentials or no network egress.
      await catalog.get("PROD-UNDO-HEALTHCHECK").catch((err) => {
        if (err?.status === 404) return; // authenticated fine, product just doesn't exist
        throw err;
      });
      body.paypal = "reachable";
    } catch (err) {
      body.ok = false;
      body.paypal = err instanceof Error ? err.message : "error";
    }
  }

  if (deep && configured.database) {
    body.database = await checkDatabase();
    if ((body.database as { ok: boolean }).ok === false) body.ok = false;
  }

  return NextResponse.json(body, { status: body.ok ? 200 : 503 });
}

/** Shape of the configured URL (never the credentials) plus a live `select 1` through the app's own pool. */
async function checkDatabase() {
  const raw = databaseUrl() ?? "";
  let url: { host: string; pooled: boolean; db: string; params: string } | string;
  try {
    const u = new URL(raw);
    url = { host: u.hostname, pooled: u.hostname.includes("-pooler"), db: u.pathname.slice(1), params: [...u.searchParams.keys()].join(",") };
  } catch {
    url = `unparseable (length ${raw.length}, starts "${raw.slice(0, 11)}", quoted: ${/^["']/.test(raw)})`;
  }
  try {
    const started = Date.now();
    await getDb().execute(sql`select 1`);
    return { ok: true, ms: Date.now() - started, url };
  } catch (err) {
    const cause = (err as { cause?: unknown })?.cause;
    const describe = (e: unknown) =>
      e instanceof Error ? `${e.name}: ${e.message}`.replace(/postgres(ql)?:\/\/[^@\s]+@/g, "postgresql://****@") : String(e);
    return { ok: false, url, error: describe(err).slice(0, 300), cause: cause ? describe(cause).slice(0, 300) : undefined };
  }
}
