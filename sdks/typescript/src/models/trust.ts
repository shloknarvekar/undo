import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { trustFactorSchema, type TrustFactor } from "./trust-factor.js";
import { trustTierSchema, type TrustTier } from "./trust-tier.js";

/** An agent's trust score at this store, with every point explained. */
export type Trust = {
  /** 0 to 100, from the agent's record at this store. */
  score: number;
  /** An agent's trust band. */
  tier: TrustTier;
  /** Every point in the score, explained. */
  factors?: TrustFactor[];
};

export const trustSchema: Schema<Trust> = s.object<Trust>({
  score: s.int(),
  tier: trustTierSchema,
  factors: s.optional(s.array(s.lazy(() => trustFactorSchema))),
});
