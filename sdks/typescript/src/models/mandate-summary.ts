import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { intentDraftSchema, type IntentDraft } from "./intent-draft.js";

/** The mandate this purchase was made under. */
export type MandateSummary = {
  /** Mandate id. */
  id?: string;
  /** The shopper's request in their own words. */
  request?: string;
  /** The shopper's limits in structured form. */
  intent?: IntentDraft;
  /** Mandate status. */
  status?: string;
  /** The shopper's public key. Undo requests must be signed by it. */
  shopperKey?: string;
};

export const mandateSummarySchema: Schema<MandateSummary> = s.object<MandateSummary>({
  id: s.optional(s.string()),
  request: s.optional(s.string()),
  intent: s.optional(s.lazy(() => intentDraftSchema)),
  status: s.optional(s.string()),
  shopperKey: s.optional(s.string()),
});
