import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** Returned with 429 when this visitor made too many requests or a free-tier budget is spent. */
export type RateLimited = {
  /** The error code on a 429. @default "rate_limited" */
  error?: "rate_limited";
  /** What happened and how long to wait, in plain words. */
  detail: string;
  /** Seconds to wait. */
  retryAfter: number;
};

export const rateLimitedSchema: Schema<RateLimited> = s.object<RateLimited>({
  error: s.defaulted(s.literal("rate_limited"), "rate_limited"),
  detail: s.string(),
  retryAfter: s.int(),
});
