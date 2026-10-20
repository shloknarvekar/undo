import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { productSchema, type Product } from "./product.js";

/** Search results. */
export type ProductSearchResult = {
  /** The catalog category the search was narrowed to. */
  category?: string | null;
  /** Products that have at least one offer. */
  products: Product[];
};

export const productSearchResultSchema: Schema<ProductSearchResult> = s.object<ProductSearchResult>({
  category: s.optionalNullable(s.string()),
  products: s.array(s.lazy(() => productSchema)),
});
