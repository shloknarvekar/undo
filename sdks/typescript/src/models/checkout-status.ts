import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Where a new checkout stands. */
export const CheckoutStatus = {
  CheckoutCreated: "CHECKOUT_CREATED",
  Authorized: "AUTHORIZED",
} as const;
export type CheckoutStatus = (typeof CheckoutStatus)[keyof typeof CheckoutStatus] | (string & {});

export const checkoutStatusSchema: EnumSchema<CheckoutStatus> = s.enumOf<CheckoutStatus>(CheckoutStatus);
