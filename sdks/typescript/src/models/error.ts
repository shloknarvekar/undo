import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** An error. error is a stable machine-readable code; detail explains it. */
export type Error = {
  /** Machine-readable code, for example `not_found`, `bad_signature`, `purchase_already_open`. */
  error: string;
  /** Human-readable detail, when there is one. */
  detail?: string;
  /** Validation problems, on `invalid_request`. */
  issues?: Record<string, unknown>[];
};

export const errorSchema: Schema<Error> = s.object<Error>({
  error: s.string(),
  detail: s.optional(s.string()),
  issues: s.optional(s.array(s.record(s.string(), s.unknown()))),
});
