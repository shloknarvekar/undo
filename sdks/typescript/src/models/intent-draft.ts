import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { genderSchema, type Gender } from "./gender.js";

/** The shopper's limits in structured form. */
export type IntentDraft = {
  /** What to buy, as a short noun phrase. */
  item: string;
  /** Product category in plain words. */
  category?: string;
  /** How many to buy. @default 1 */
  quantity?: number;
  /** Ceiling per item; 0 means no budget was given. */
  maxPrice: number;
  /** Currency of maxPrice. @default "USD" */
  currency?: string;
  /** Required attribute values, keys lowercase. */
  attributes?: Record<string, string>;
  /** Men's or women's products. */
  gender?: Gender;
  /** Only these brands, if the shopper named any. */
  brands?: string[];
  /** ISO date the item must arrive by. */
  deadline?: string;
  /** Soft preferences that are not hard limits. */
  notes?: string;
  /** Questions to answer before the draft can be signed. */
  mustAsk?: string[];
};

export const intentDraftSchema: Schema<IntentDraft> = s.object<IntentDraft>({
  item: s.string(),
  category: s.optional(s.string()),
  quantity: s.defaulted(s.int(), 1),
  maxPrice: s.float64(),
  currency: s.defaulted(s.string(), "USD"),
  attributes: s.optional(s.record(s.string(), s.string())),
  gender: s.optional(s.lazy(() => genderSchema)),
  brands: s.optional(s.array(s.string())),
  deadline: s.optional(s.string()),
  notes: s.optional(s.string()),
  mustAsk: s.optional(s.array(s.string())),
});
