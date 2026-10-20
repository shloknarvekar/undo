import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { agentRecordSchema, type AgentRecord } from "./agent-record.js";
import { merchantRulesSchema, type MerchantRules } from "./merchant-rules.js";

/** Every agent that has shopped here and the store's rules. */
export type MerchantAgents = {
  /** The store's rules for agents. They apply from the next checkout. */
  rules: MerchantRules;
  /** Every agent that has shopped here, riskiest first. */
  agents: AgentRecord[];
};

export const merchantAgentsSchema: Schema<MerchantAgents> = s.object<MerchantAgents>({
  rules: merchantRulesSchema,
  agents: s.array(s.lazy(() => agentRecordSchema)),
});
