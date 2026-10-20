import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** The shopper's words to turn into a draft. */
export type DraftMandateRequest = {
  /** The shopper's own words. */
  request: string;
};

export const draftMandateRequestSchema: Schema<DraftMandateRequest> = s.object<DraftMandateRequest>({
  request: s.string(),
});
