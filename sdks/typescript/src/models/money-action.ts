import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { moneyActionTypeSchema, type MoneyActionType } from "./money-action-type.js";

/** What happens to the money after the verdict. */
export type MoneyAction = {
  /** What happens to the money. */
  type: MoneyActionType;
  /** Why, in plain words. */
  reason: string;
  /** On AUTHORIZE_RETURN, the amount refunded when the item comes back. */
  refundOnReturn?: string;
  /** On AUTHORIZE_RETURN. */
  restockingFee?: string;
};

export const moneyActionSchema: Schema<MoneyAction> = s.object<MoneyAction>({
  type: moneyActionTypeSchema,
  reason: s.string(),
  refundOnReturn: s.optional(s.string()),
  restockingFee: s.optional(s.string()),
});
