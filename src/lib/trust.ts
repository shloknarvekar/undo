/**
 * Agent trust and merchant rules.
 *
 * Every agent that has shopped through Undo has a record: purchases, agent-fault verdicts, carts the guard refused,
 * and purchases where it skipped the guard. That record becomes a 0–100 trust score with every point explained.
 * The merchant sets rules on it (block agents below a score, give low-trust agents a longer undo window, or block
 * unregistered agents), and Undo applies them at checkout for every agent, web or MCP.
 */
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { MAX_WINDOW_MINUTES, type UndoWindow } from "./agent-core";

// ── Who the agent is ───────────────────────────────────────────────────────────────────────────

export type Operator = { name: string; verified: boolean; via?: string };

/** The operator recorded on an order. Orders from before operators were recorded came from Undo's own web agent (or its careless twin). */
export function operatorOf(agent: unknown): Operator {
  const a = (agent ?? {}) as { simulated?: string; operator?: Operator };
  return a.operator ?? { name: a.simulated ? "Careless demo agent" : "Undo web agent", verified: !a.simulated, via: "web" };
}

// ── The score ──────────────────────────────────────────────────────────────────────────────────

export type AgentRecord = {
  name: string;
  verified: boolean;
  via: string;
  /** Purchases that went through (money authorized at least once). */
  purchases: number;
  /** Purchases undone with an agent-fault verdict. */
  faults: number;
  /** Carts Undo's guard refused before checkout. */
  refused: number;
  /** Purchases where the agent skipped Undo's pre-purchase check. */
  bypassed: number;
  lastSeen: string | null;
};

export type Trust = { score: number; tier: "trusted" | "neutral" | "risky"; factors: { label: string; points: number }[] };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function scoreAgent(r: AgentRecord): Trust {
  const factors: Trust["factors"] = [{ label: r.verified ? "registered operator" : "unregistered name", points: r.verified ? 70 : 50 }];
  const clean = Math.max(0, r.purchases - r.faults);
  if (clean) factors.push({ label: plural(clean, "clean purchase"), points: Math.min(30, clean * 3) });
  if (r.faults) factors.push({ label: plural(r.faults, "agent-fault verdict"), points: -20 * r.faults });
  if (r.refused) factors.push({ label: `${plural(r.refused, "cart")} refused by the guard`, points: -Math.min(30, r.refused * 5) });
  if (r.bypassed) factors.push({ label: `${plural(r.bypassed, "purchase")} that skipped the guard`, points: -Math.min(30, r.bypassed * 10) });
  const score = Math.max(0, Math.min(100, factors.reduce((s, f) => s + f.points, 0)));
  return { score, tier: score >= 80 ? "trusted" : score >= 50 ? "neutral" : "risky", factors };
}

/** An agent Undo has never seen starts from its registration alone. */
export const newRecord = (op: Operator): AgentRecord => ({ name: op.name, verified: op.verified, via: op.via ?? "web", purchases: 0, faults: 0, refused: 0, bypassed: 0, lastSeen: null });

// ── The merchant's rules ───────────────────────────────────────────────────────────────────────

export const MerchantRules = z.object({
  /** Refuse checkout for agents scoring below this (null = off). */
  blockBelow: z.number().int().min(1).max(100).nullable(),
  /** Give agents scoring below this a longer undo window (null = off). */
  extendBelow: z.number().int().min(1).max(100).nullable(),
  /** How much longer, in minutes. */
  extendMinutes: z.number().int().min(15).max(24 * 60),
  /** Refuse agents that didn't present a registered operator key. */
  blockUnverified: z.boolean(),
});
export type MerchantRules = z.infer<typeof MerchantRules>;

export const DEFAULT_RULES: MerchantRules = { blockBelow: null, extendBelow: 50, extendMinutes: 6 * 60, blockUnverified: false };

export type RuleEffect = { blocked: string | null; extraMinutes: number; reason: string | null };

/** What the merchant's rules do to this agent's purchase right now. */
export function ruleEffect(op: Operator, trust: Trust, rules: MerchantRules): RuleEffect {
  if (rules.blockUnverified && !op.verified) return { blocked: "This store only accepts registered agent operators.", extraMinutes: 0, reason: null };
  if (rules.blockBelow !== null && trust.score < rules.blockBelow) {
    return { blocked: `This store doesn't accept agents with a trust score below ${rules.blockBelow}; ${op.name} scores ${trust.score}.`, extraMinutes: 0, reason: null };
  }
  if (rules.extendBelow !== null && trust.score < rules.extendBelow) {
    return { blocked: null, extraMinutes: rules.extendMinutes, reason: `merchant rule: ${op.name} trust ${trust.score}, below ${rules.extendBelow}` };
  }
  return { blocked: null, extraMinutes: 0, reason: null };
}

/** The undo window with the merchant's extra time added as its own, visible factor. */
export function withRule(window: UndoWindow, effect: RuleEffect): UndoWindow {
  if (!effect.extraMinutes || !effect.reason) return window;
  const factors = [...window.factors, { factor: effect.reason, minutes: effect.extraMinutes }];
  return { minutes: Math.min(MAX_WINDOW_MINUTES, factors.reduce((s, f) => s + f.minutes, 0)), factors };
}

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
