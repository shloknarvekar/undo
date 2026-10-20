import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { cartSchema, type Cart } from "./cart.js";
import { checkoutStatusSchema, type CheckoutStatus } from "./checkout-status.js";
import { paidWithSchema, type PaidWith } from "./paid-with.js";
import { trustSchema, type Trust } from "./trust.js";
import { undoWindowSchema, type UndoWindow } from "./undo-window.js";

/** A checkout opened by Undo's agent inside a mandate. */
export type ShopResult = {
  /** The new order. Read it with getOrder. */
  orderId: string;
  /** Where the shopper approves the payment in PayPal (absent when paid with a saved wallet). */
  approveUrl?: string | null;
  /** Where a new checkout stands. */
  status: CheckoutStatus;
  /** When the undo window closes, once the money is held. */
  windowEndsAt?: Date | null;
  /** How a purchase was paid. */
  paidWith: PaidWith;
  /** Why a saved wallet was not used, when the mandate allowed one. */
  walletNote?: string;
  /** What the agent put in the cart. */
  cart: Cart;
  /** The agent's reasoning, confidence and the guard's checks. */
  agent: Record<string, unknown>;
  /** How long the shopper can undo for free, and why. */
  undoWindow: UndoWindow;
  /** An agent's trust score at this store, with every point explained. */
  trust: Trust;
};

export const shopResultSchema: Schema<ShopResult> = s.object<ShopResult>({
  orderId: s.string(),
  approveUrl: s.optionalNullable(s.string()),
  status: checkoutStatusSchema,
  windowEndsAt: s.optionalNullable(s.dateTime()),
  paidWith: paidWithSchema,
  walletNote: s.optional(s.string()),
  cart: cartSchema,
  agent: s.record(s.string(), s.unknown()),
  undoWindow: undoWindowSchema,
  trust: trustSchema,
});
