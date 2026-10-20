import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** What the merchant's decision did. */
export type ResolveOrderResult = {
  /** The order that was resolved. */
  orderId: string;
};

export const resolveOrderResultSchema: Schema<ResolveOrderResult> = s.object<ResolveOrderResult>({
  orderId: s.string(),
});
