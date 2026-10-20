/**
 * Agent trust and merchant rules.
 *
 * Every agent that has shopped through Undo has a record: purchases, agent-fault verdicts, carts the guard refused,
 * and purchases where it skipped the guard. That record becomes a 0–100 trust score with every point explained.
 * The merchant sets rules on it (block agents below a score, give low-trust agents a longer undo window, or block
 * unregistered agents), and Undo applies them at checkout for every agent, web or MCP.
 */
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DEFAULT_RULES, MerchantRules, newRecord, operatorOf, ruleEffect, scoreAgent, type AgentRecord, type Operator, type RuleEffect, type Trust } from "./trust-core";

export * from "./trust-core";

// ── Reading records and rules ──────────────────────────────────────────────────────────────────

const RULES_KEY = "agent-rules";

export async function loadRules(): Promise<MerchantRules> {
  const [row] = await getDb().select().from(schema.merchantSettings).where(eq(schema.merchantSettings.key, RULES_KEY)).limit(1);
  const parsed = MerchantRules.safeParse(row?.value);
  return parsed.success ? parsed.data : DEFAULT_RULES;
}

export async function saveRules(rules: MerchantRules): Promise<void> {
  await getDb()
    .insert(schema.merchantSettings)
    .values({ key: RULES_KEY, value: rules })
    .onConflictDoUpdate({ target: schema.merchantSettings.key, set: { value: rules, updatedAt: new Date() } });
}

const PLACED = new Set(["AUTHORIZED", "VOIDED", "CAPTURED", "REFUNDED", "PARTIALLY_REFUNDED", "CLAIM_OPEN", "RETURN_PENDING", "REVIEW", "DISPUTED"]);

/** Every agent's record, from the orders it placed and the carts the guard refused it. */
export async function agentRecords(): Promise<Map<string, AgentRecord>> {
  const db = getDb();
  const [orders, refusals] = await Promise.all([
    db.select({ agent: schema.orders.agent, status: schema.orders.status, resolution: schema.orders.resolution, createdAt: schema.orders.createdAt }).from(schema.orders),
    db
      .select({ payload: schema.events.payload, createdAt: schema.events.createdAt })
      .from(schema.events)
      .where(sql`${schema.events.type} = 'AGENT_CART_REJECTED'`),
  ]);
  const records = new Map<string, AgentRecord>();
  const get = (op: Operator) => {
    const r = records.get(op.name) ?? newRecord(op);
    if (op.verified) r.verified = true; // a name counts as registered once it has presented a key
    records.set(op.name, r);
    return r;
  };
  const seen = (r: AgentRecord, at: string) => {
    if (!r.lastSeen || at > r.lastSeen) r.lastSeen = at;
  };
  for (const o of orders) {
    if (!PLACED.has(o.status)) continue;
    const r = get(operatorOf(o.agent));
    r.purchases++;
    if ((o.agent as { guard?: { bypassed?: boolean } })?.guard?.bypassed) r.bypassed++;
    if ((o.resolution as { decision?: { verdict?: string } } | null)?.decision?.verdict === "AGENT_FAULT") r.faults++;
    seen(r, o.createdAt.toISOString());
  }
  for (const e of refusals) {
    const op = (e.payload as { operator?: Operator })?.operator;
    if (!op?.name) continue;
    const r = get(op);
    r.refused++;
    seen(r, e.createdAt);
  }
  return records;
}

/** The trust score and the rule effect for one agent about to buy, judged on how it identified itself this time. */
export async function checkAgent(op: Operator): Promise<{ trust: Trust; effect: RuleEffect; record: AgentRecord }> {
  const [records, rules] = await Promise.all([agentRecords(), loadRules()]);
  const record = records.get(op.name) ?? newRecord(op);
  const trust = scoreAgent({ ...record, verified: op.verified });
  return { trust, effect: ruleEffect(op, trust, rules), record };
}
