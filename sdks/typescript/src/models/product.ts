import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { variantOptionSchema, type VariantOption } from "./variant-option.js";

/** A catalog product resolved to one offer and one exact variant. */
export type Product = {
  /** Catalog product id. Use it with getProduct. */
  channel3Id: string;
  /** Product title. */
  title: string;
  /** Brand name, when known. */
  brand?: string | null;
  /** Product description from the retailer, when there is one. */
  description?: string | null;
  /** Price of the chosen offer, per item. */
  price: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Product image URL, when there is one. */
  imageUrl?: string | null;
  /** Where the product is sold. */
  sourceUrl: string;
  /** The retailer's domain. */
  sourceDomain: string;
  /** Colors of the product as hex codes. */
  colors: string[];
  /** Catalog attributes. Each value is a list of strings, for example activity: [Running]. */
  attributes: Record<string, unknown>;
  /** The exact variant this offer resolves to, for example Size M and Color Black. */
  variant: Record<string, string>;
  /** Every option the product comes in, with its values. */
  variantOptions: VariantOption[];
};

export const productSchema: Schema<Product> = s.object<Product>({
  channel3Id: s.string(),
  title: s.string(),
  brand: s.optionalNullable(s.string()),
  description: s.optionalNullable(s.string()),
  price: s.float64(),
  currency: s.string(),
  imageUrl: s.optionalNullable(s.string()),
  sourceUrl: s.string(),
  sourceDomain: s.string(),
  colors: s.array(s.string()),
  attributes: s.record(s.string(), s.unknown()),
  variant: s.record(s.string(), s.string()),
  variantOptions: s.array(s.lazy(() => variantOptionSchema)),
});
