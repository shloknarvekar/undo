import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** What the agent put in the cart. */
export type Cart = {
  /** Product title. */
  title: string;
  /** Brand name, when known. */
  brand?: string | null;
  /** The exact variant bought. */
  variant: Record<string, string>;
  /** Price per item in currency units. */
  price: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Number of items. */
  quantity: number;
  /** The retailer's domain. */
  retailer?: string;
  /** Product image URL, when there is one. */
  imageUrl?: string | null;
};

export const cartSchema: Schema<Cart> = s.object<Cart>({
  title: s.string(),
  brand: s.optionalNullable(s.string()),
  variant: s.record(s.string(), s.string()),
  price: s.float64(),
  currency: s.string(),
  quantity: s.int(),
  retailer: s.optional(s.string()),
  imageUrl: s.optionalNullable(s.string()),
});
