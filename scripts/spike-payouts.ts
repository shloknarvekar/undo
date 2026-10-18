/**
 * Payouts spike: proves agent-fault liability settles for real.
 *
 *   npm run spike:payouts -- check    → the agent-operator credentials authenticate (prints no secrets)
 *   npm run spike:payouts -- settle   → finds an agent-fault order the merchant already refunded with no settlement
 *                                      yet, has the operator pay the merchant back, and waits for PayPal to finish
 */
import "dotenv/config";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "../src/db";
import { refreshSettlements, settleAgentLiability, type Settlement } from "../src/lib/money";

const BASE = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function check() {
  const id = process.env.PAYPAL_OPERATOR_CLIENT_ID;
  const secret = process.env.PAYPAL_OPERATOR_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PAYPAL_OPERATOR_CLIENT_ID / PAYPAL_OPERATOR_CLIENT_SECRET are not in .env");
  if (id === process.env.PAYPAL_CLIENT_ID) throw new Error("The operator app is the same as the store's app: money would move to itself. Use the app made for the Agent Operator account.");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Operator OAuth failed: ${body.error_description ?? res.status}`);
  const scopes: string[] = String(body.scope ?? "").split(" ");
  const payouts = scopes.some((s) => s.includes("payouts"));
  console.log(`✔ operator credentials authenticate (app ${id.slice(0, 6)}…)`);
  console.log(`${payouts ? "✔" : "✖"} Payouts scope ${payouts ? "granted" : "missing: tick Payouts under the app's Features and save"}`);
}

async function settle() {
  const db = getDb();
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.status, "REFUNDED"),
        sql`${schema.orders.resolution}->'decision'->>'verdict' = 'AGENT_FAULT'`,
        sql`${schema.orders.resolution}->'settlement' is null`,
      ),
    )
    .orderBy(desc(schema.orders.updatedAt))
    .limit(1);
  if (!order) throw new Error("No refunded agent-fault order without a settlement. Run a fresh agent-fault Undo after capture.");
  console.log(`  order ${order.id}: ${order.amount} ${order.currency} refunded to the shopper; the merchant hasn't been paid back`);

  const s = await settleAgentLiability(order, order.amount, 1);
  console.log(`${s.status === "FAILED" || s.status === "NOT_CONFIGURED" ? "✖" : "✔"} payout ${s.status}: ${s.from} → merchant ${s.to ?? "?"} ${s.amount} ${s.currency}${s.payoutBatchId ? ` (batch ${s.payoutBatchId})` : ""}`);
  if (s.error) console.log(`  error: ${s.error}`);
  if (s.status !== "PENDING") return;

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    await refreshSettlements();
    const [row] = await db.select({ resolution: schema.orders.resolution }).from(schema.orders).where(eq(schema.orders.id, order.id));
    const now = (row.resolution as { settlement: Settlement }).settlement;
    if (now.status !== "PENDING") {
      console.log(`${now.status === "SUCCESS" ? "✔" : "✖"} PayPal says ${now.status}${now.transactionId ? `: transaction ${now.transactionId}` : ""}${now.error ? ` (${now.error})` : ""}`);
      return;
    }
  }
  console.log("… still PENDING after a minute; the app's sweep will keep checking.");
}

(process.argv[2] === "settle" ? settle() : check()).then(
  () => process.exit(0),
  (err) => {
    console.error(`✖ ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  },
);
