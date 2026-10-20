import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { intentDraftSchema, type IntentDraft } from "./intent-draft.js";
import { readyCheckSchema, type ReadyCheck } from "./ready-check.js";

/** A structured draft of the shopper's limits, ready for review. */
export type DraftResult = {
  /** The request text, when it was extended with answers. */
  request?: string;
  /** The shopper's limits in structured form. */
  draft: IntentDraft;
  /** Whether a draft can be signed as is. */
  ready: ReadyCheck;
};

export const draftResultSchema: Schema<DraftResult> = s.object<DraftResult>({
  request: s.optional(s.string()),
  draft: intentDraftSchema,
  ready: readyCheckSchema,
});
