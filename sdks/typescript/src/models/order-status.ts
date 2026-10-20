import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Where an order stands. AUTHORIZED means the money is only held and Undo is a free void. */
export const OrderStatus = {
  CheckoutCreated: "CHECKOUT_CREATED",
  Cancelled: "CANCELLED",
  Authorized: "AUTHORIZED",
  Voided: "VOIDED",
  Captured: "CAPTURED",
  Refunded: "REFUNDED",
  PartiallyRefunded: "PARTIALLY_REFUNDED",
  ClaimOpen: "CLAIM_OPEN",
  ReturnPending: "RETURN_PENDING",
  Review: "REVIEW",
  Disputed: "DISPUTED",
  Failed: "FAILED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus] | (string & {});

export const orderStatusSchema: EnumSchema<OrderStatus> = s.enumOf<OrderStatus>(OrderStatus);
