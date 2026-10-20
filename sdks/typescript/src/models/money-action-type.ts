import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** What happens to the money. */
export const MoneyActionType = {
  Void: "VOID",
  RefundFull: "REFUND_FULL",
  OpenClaim: "OPEN_CLAIM",
  AuthorizeReturn: "AUTHORIZE_RETURN",
  Review: "REVIEW",
  None: "NONE",
} as const;
export type MoneyActionType = (typeof MoneyActionType)[keyof typeof MoneyActionType] | (string & {});

export const moneyActionTypeSchema: EnumSchema<MoneyActionType> = s.enumOf<MoneyActionType>(MoneyActionType);
