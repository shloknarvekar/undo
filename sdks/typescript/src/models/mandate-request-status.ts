import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Where a mandate request stands. */
export const MandateRequestStatus = {
  Pending: "PENDING",
  Signed: "SIGNED",
  Expired: "EXPIRED",
} as const;
export type MandateRequestStatus =
  | (typeof MandateRequestStatus)[keyof typeof MandateRequestStatus]
  | (string & {});

export const mandateRequestStatusSchema: EnumSchema<MandateRequestStatus> =
  s.enumOf<MandateRequestStatus>(MandateRequestStatus);
