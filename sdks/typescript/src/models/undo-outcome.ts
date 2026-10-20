import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { moneyActionSchema, type MoneyAction } from "./money-action.js";
import { orderStatusSchema, type OrderStatus } from "./order-status.js";

/** What happened to the money and the order's new status. */
export type UndoOutcome = {
  /** What happens to the money after the verdict. */
  action: MoneyAction;
  /** Where an order stands. AUTHORIZED means the money is only held and Undo is a free void. */
  status: OrderStatus;
  /** The PayPal ids behind the money movement. */
  paypal: Record<string, string | null>;
  /** SHA-256 of the evidence pack sent with a merchant claim. */
  evidenceDigest?: string;
};

export const undoOutcomeSchema: Schema<UndoOutcome> = s.object<UndoOutcome>({
  action: moneyActionSchema,
  status: orderStatusSchema,
  paypal: s.record(s.string(), s.nullable(s.string())),
  evidenceDigest: s.optional(s.string()),
});
