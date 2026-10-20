import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { orderStatusSchema, type OrderStatus } from "./order-status.js";
import { payPalIdsSchema, type PayPalIds } from "./pay-pal-ids.js";
import { productSchema, type Product } from "./product.js";

/** The purchase. */
export type Order = {
  /** Undo order id. */
  id: string;
  /** Where an order stands. AUTHORIZED means the money is only held and Undo is a free void. */
  status: OrderStatus;
  /** Total held or charged, as a decimal string. */
  amount: string;
  /** ISO 4217 currency code. */
  currency: string;
  /** Number of items. */
  quantity: number;
  /** A catalog product resolved to one offer and one exact variant. */
  product: Product;
  /** The agent's reasoning, confidence, guard checks and operator, as recorded at checkout. */
  agent?: Record<string, unknown>;
  /** The PayPal ids behind this order. */
  paypal: PayPalIds;
  /** The latest Undo, with verdict, evidence, money action and any agent payout. */
  resolution?: Record<string, unknown> | null;
};

export const orderSchema: Schema<Order> = s.object<Order>({
  id: s.string(),
  status: orderStatusSchema,
  amount: s.string(),
  currency: s.string(),
  quantity: s.int(),
  product: productSchema,
  agent: s.optional(s.record(s.string(), s.unknown())),
  paypal: payPalIdsSchema,
  resolution: s.optionalNullable(s.record(s.string(), s.unknown())),
});
