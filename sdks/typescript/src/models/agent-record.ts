import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { ruleEffectSchema, type RuleEffect } from "./rule-effect.js";
import { trustSchema, type Trust } from "./trust.js";

/** An agent's record at this store and what the rules do to it. */
export type AgentRecord = {
  /** The agent operator's name. */
  name: string;
  /** Whether the agent presented a registered operator key. */
  verified: boolean;
  /** How the agent connected: web or mcp. */
  via?: string | null;
  /** Purchases made at this store. */
  purchases?: number;
  /** Undos where the agent was at fault. */
  faults?: number;
  /** An agent's trust score at this store, with every point explained. */
  trust: Trust;
  /** What the store's rules do to this agent's next purchase. */
  effect: RuleEffect;
};

export const agentRecordSchema: Schema<AgentRecord> = s.object<AgentRecord>({
  name: s.string(),
  verified: s.boolean(),
  via: s.optionalNullable(s.string()),
  purchases: s.optional(s.int()),
  faults: s.optional(s.int()),
  trust: trustSchema,
  effect: ruleEffectSchema,
});
