import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/** Neon over HTTP: no connection pool to manage, works the same on Render and in local scripts. */
let db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL missing in .env (Neon connection string)");
    db = drizzle(neon(url), { schema });
  }
  return db;
}

export { schema };
