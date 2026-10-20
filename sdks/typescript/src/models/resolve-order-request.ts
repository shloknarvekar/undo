import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { resolveActionSchema, type ResolveAction } from "./resolve-action.js";

/** What the merchant decided. */
export type ResolveOrderRequest = {
  /** What the merchant decides about an order. */
  action: ResolveAction;
};

export const resolveOrderRequestSchema: Schema<ResolveOrderRequest> = s.object<ResolveOrderRequest>({
  action: resolveActionSchema,
});
