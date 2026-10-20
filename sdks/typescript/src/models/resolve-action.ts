import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** What the merchant decides about an order. */
export const ResolveAction = {
  AcceptClaim: "accept_claim",
  ReturnReceived: "return_received",
  RetrySettlement: "retry_settlement",
} as const;
export type ResolveAction = (typeof ResolveAction)[keyof typeof ResolveAction] | (string & {});

export const resolveActionSchema: EnumSchema<ResolveAction> = s.enumOf<ResolveAction>(ResolveAction);
