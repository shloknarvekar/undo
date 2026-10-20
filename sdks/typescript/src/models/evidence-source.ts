import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Where a finding came from. */
export const EvidenceSource = {
  MandateCheck: "mandate_check",
  AgentRecord: "agent_record",
  DeliveredPhoto: "delivered_photo",
  AiJudgement: "ai_judgement",
  Shopper: "shopper",
} as const;
export type EvidenceSource = (typeof EvidenceSource)[keyof typeof EvidenceSource] | (string & {});

export const evidenceSourceSchema: EnumSchema<EvidenceSource> = s.enumOf<EvidenceSource>(EvidenceSource);
