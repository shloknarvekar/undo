import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Who pays. Null when a person still has to decide. */
export const Liability = {
  AgentOperator: "agent_operator",
  Merchant: "merchant",
  Shopper: "shopper",
} as const;
export type Liability = (typeof Liability)[keyof typeof Liability] | (string & {});

export const liabilitySchema: EnumSchema<Liability> = s.enumOf<Liability>(Liability);
