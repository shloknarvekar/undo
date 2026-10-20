import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** The error code on a 429. */
export const RateLimitCode = {
  RateLimited: "rate_limited",
} as const;
export type RateLimitCode = (typeof RateLimitCode)[keyof typeof RateLimitCode] | (string & {});

export const rateLimitCodeSchema: EnumSchema<RateLimitCode> = s.enumOf<RateLimitCode>(RateLimitCode);
