import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** How a purchase was paid. */
export const PaidWith = {
  Approval: "approval",
  SavedWallet: "saved_wallet",
} as const;
export type PaidWith = (typeof PaidWith)[keyof typeof PaidWith] | (string & {});

export const paidWithSchema: EnumSchema<PaidWith> = s.enumOf<PaidWith>(PaidWith);
