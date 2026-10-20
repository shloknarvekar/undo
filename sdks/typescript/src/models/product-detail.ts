import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { productSchema, type Product } from "./product.js";

/** A product at the requested variant, plus any option the catalog couldn't honor. */
export type ProductDetail = {
  /** A catalog product resolved to one offer and one exact variant. */
  product: Product;
  /** Requested options the catalog could not honor. */
  relaxed: Record<string, unknown>[];
};

export const productDetailSchema: Schema<ProductDetail> = s.object<ProductDetail>({
  product: productSchema,
  relaxed: s.array(s.record(s.string(), s.unknown())),
});
