/**
 * Read-only: lists recent orders with their outcome, to pick one real finished case per outcome for the landing page.
 * Run: npx tsx --env-file=.env scripts/list-cases.ts
 */
import { desc } from "drizzle-orm";
import { getDb } from "../src/db";
import { orders } from "../src/db/schema";

async function main() {
  const rows = await getDb()
    .select({ id: orders.id, status: orders.status, amount: orders.amount, product: orders.product, resolution: orders.resolution, createdAt: orders.createdAt })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(200);
  for (const r of rows) {
    const res = (r.resolution ?? {}) as Record<string, unknown>;
    const p = r.product as { title?: string };
    console.log([r.createdAt.toISOString().slice(0, 16), r.status.padEnd(16), r.id, `$${r.amount}`.padEnd(8), (p.title ?? "").slice(0, 36), JSON.stringify(res).slice(0, 160)].join("  "));
  }
  process.exit(0);
}
main();
