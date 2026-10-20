import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** The store's rules for agents. They apply from the next checkout. */
export type MerchantRules = {
  /** Refuse agents scoring below this. Null turns it off. */
  blockBelow: number | null;
  /** Give agents scoring below this a longer window. Null turns it off. */
  extendBelow: number | null;
  /** How much longer. */
  extendMinutes: number;
  /** Refuse agents without a registered operator key. */
  blockUnverified: boolean;
};

export const merchantRulesSchema: Schema<MerchantRules> = s.object<MerchantRules>({
  blockBelow: s.nullable(s.int()),
  extendBelow: s.nullable(s.int()),
  extendMinutes: s.int(),
  blockUnverified: s.boolean(),
});
