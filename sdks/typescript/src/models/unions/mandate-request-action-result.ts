import * as s from "../../core/validation/index.js";
import type { Schema } from "../../core/validation/schema.js";
import { draftResultSchema, type DraftResult } from "../draft-result.js";
import { preparedMandateSchema, type PreparedMandate } from "../prepared-mandate.js";

/** The new draft after answer, or the mandate to sign after prepare. */
export type MandateRequestActionResult = DraftResult | PreparedMandate;

export const mandateRequestActionResultSchema: Schema<MandateRequestActionResult> =
  s.of<MandateRequestActionResult>(
    s.union([s.lazy(() => draftResultSchema), s.lazy(() => preparedMandateSchema)]),
  );
