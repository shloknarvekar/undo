/**
 * Apply Drizzle migrations (./drizzle) to Neon over the DIRECT connection (DATABASE_URL_UNPOOLED), using the
 * serverless driver's WebSocket transport so it works on networks that block TCP 5432.
 * Drizzle records applied migrations in drizzle.__drizzle_migrations, so re-running is a no-op.
 *
 * Run: npm run db:migrate
 */
import "dotenv/config";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED;
  if (!url) throw new Error("DATABASE_URL_UNPOOLED missing in .env (run `neon env pull`)");
  if (new URL(url).hostname.includes("-pooler")) throw new Error("DATABASE_URL_UNPOOLED points at a -pooler host; migrations need the direct one");
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    await migrate(drizzle({ client: pool }), { migrationsFolder: "./drizzle" });
    const { rows } = await pool.query(
      "select table_name from information_schema.tables where table_schema = 'public' order by 1",
    );
    console.log(`✔ Migrations applied. public tables: ${rows.map((r: { table_name: string }) => r.table_name).join(", ")}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(`✖ Migration failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
