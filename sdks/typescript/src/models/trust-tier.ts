import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** An agent's trust band. */
export const TrustTier = {
  Trusted: "trusted",
  Neutral: "neutral",
  Risky: "risky",
} as const;
export type TrustTier = (typeof TrustTier)[keyof typeof TrustTier] | (string & {});

export const trustTierSchema: EnumSchema<TrustTier> = s.enumOf<TrustTier>(TrustTier);
