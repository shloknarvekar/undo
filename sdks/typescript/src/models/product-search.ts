import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { genderSchema, type Gender } from "./gender.js";
import { searchModeSchema, type SearchMode } from "./search-mode.js";

/** A catalog search with structured filters. */
export type ProductSearch = {
  /** What to search for, in plain words. */
  query: string;
  /** Highest price per item. */
  maxPrice?: number;
  /** Lowest price per item. */
  minPrice?: number;
  /** Color name, for example black. */
  color?: string;
  /** Plain-words category, resolved server-side. */
  category?: string;
  /** Men's or women's products. */
  gender?: Gender;
  /** How many products to return. */
  limit?: number;
  /** How the catalog reads the query. */
  mode?: SearchMode;
};

export const productSearchSchema: Schema<ProductSearch> = s.object<ProductSearch>({
  query: s.string(),
  maxPrice: s.optional(s.float64()),
  minPrice: s.optional(s.float64()),
  color: s.optional(s.string()),
  category: s.optional(s.string()),
  gender: s.optional(s.lazy(() => genderSchema)),
  limit: s.optional(s.int()),
  mode: s.optional(s.lazy(() => searchModeSchema)),
});
