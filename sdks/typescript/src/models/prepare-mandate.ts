import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { intentDraftSchema, type IntentDraft } from "./intent-draft.js";
import { payWithSchema, type PayWith } from "./pay-with.js";

/** What's needed to build the exact mandate a device will sign. */
export type PrepareMandate = {
  /** The shopper's request in their own words, kept verbatim inside the mandate. */
  request: string;
  /** The shopper's limits in structured form. */
  draft: IntentDraft;
  /** Base64 Ed25519 public key. */
  shopperKey: string;
  /** How the agent may pay. */
  payWith?: PayWith;
};

export const prepareMandateSchema: Schema<PrepareMandate> = s.object<PrepareMandate>({
  request: s.string(),
  draft: intentDraftSchema,
  shopperKey: s.string(),
  payWith: s.optional(s.lazy(() => payWithSchema)),
});
