import { Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

/**
 * Neon serverless driver with a WebSocket Pool over the *pooled* URL (DATABASE_URL, host has -pooler).
 *
 * Why not node-postgres (Neon's default pick for long-running servers like Render)? It speaks TCP 5432, which
 * the developer's network blocks; the serverless driver tunnels Postgres over WebSockets on 443, works the same
 * on Render, and supports transactions/sessions. Node 22+ ships a global WebSocket, so no `ws` package needed.
 * Migrations use the direct URL (DATABASE_URL_UNPOOLED) — see scripts/migrate.ts.
 */
let db: NeonDatabase<typeof schema> | null = null;

/** DATABASE_URL as given, minus whitespace and wrapping quotes (`neon env pull` writes it quoted, and that gets pasted into hosts). */
export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
}

export function getDb(): NeonDatabase<typeof schema> {
  if (!db) {
    const url = databaseUrl();
    if (!url) throw new Error("DATABASE_URL missing in .env (Neon pooled connection string)");
    const pool = new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 30_000 });
    pool.on("error", (err: Error) => console.error("neon pool error", err.message));
    db = drizzle({ client: pool, schema });
  }
  return db;
}

/** Postgres error code/constraint, whether the driver error is thrown directly or wrapped by Drizzle. */
export function pgError(err: unknown): { code?: string; constraint?: string } {
  const e = err as { code?: string; constraint?: string; cause?: unknown } | null;
  if (e?.code) return { code: e.code, constraint: e.constraint };
  return e?.cause ? pgError(e.cause) : {};
}

export { schema };
