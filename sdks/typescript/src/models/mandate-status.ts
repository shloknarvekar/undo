import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Where a mandate stands. */
export const MandateStatus = {
  Active: "ACTIVE",
  Fulfilled: "FULFILLED",
  Revoked: "REVOKED",
  Expired: "EXPIRED",
} as const;
export type MandateStatus = (typeof MandateStatus)[keyof typeof MandateStatus] | (string & {});

export const mandateStatusSchema: EnumSchema<MandateStatus> = s.enumOf<MandateStatus>(MandateStatus);
