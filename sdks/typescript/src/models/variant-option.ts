import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** One option a product comes in, with its values. */
export type VariantOption = {
  /** Option name, for example Size. */
  name: string;
  /** Available values, for example S, M, L. */
  values: string[];
};

export const variantOptionSchema: Schema<VariantOption> = s.object<VariantOption>({
  name: s.string(),
  values: s.array(s.string()),
});
