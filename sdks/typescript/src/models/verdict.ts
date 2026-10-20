import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Who was at fault. */
export const Verdict = {
  AgentFault: "AGENT_FAULT",
  MerchantFault: "MERCHANT_FAULT",
  ShopperChangedMind: "SHOPPER_CHANGED_MIND",
  Inconclusive: "INCONCLUSIVE",
} as const;
export type Verdict = (typeof Verdict)[keyof typeof Verdict] | (string & {});

export const verdictSchema: EnumSchema<Verdict> = s.enumOf<Verdict>(Verdict);
