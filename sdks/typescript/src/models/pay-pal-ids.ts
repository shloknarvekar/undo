import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** The PayPal ids behind this order. */
export type PayPalIds = {
  /** PayPal Orders v2 id. */
  orderId?: string | null;
  /** PayPal authorization id, once the money is held. */
  authorizationId?: string | null;
  /** PayPal capture id, once the money is taken. */
  captureId?: string | null;
};

export const payPalIdsSchema: Schema<PayPalIds> = s.object<PayPalIds>({
  orderId: s.optionalNullable(s.string()),
  authorizationId: s.optionalNullable(s.string()),
  captureId: s.optionalNullable(s.string()),
});
