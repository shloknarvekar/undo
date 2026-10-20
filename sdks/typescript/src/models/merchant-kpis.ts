import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** Headline numbers for the store. */
export type MerchantKpis = {
  /** Orders placed by agents (not counting abandoned checkouts). */
  agentOrders: number;
  /** Orders that were undone. */
  undone: number;
  /** Estimated PayPal fees avoided by voiding instead of refunding. */
  feesAvoided: number;
  /** Money paid back to the store by agent operators through PayPal Payouts. */
  billedToAgents: number;
  /** Undos where the shopper changed their mind and the store was protected. */
  merchantProtected: number;
  /** Orders waiting for the store's decision. */
  needsAction: number;
  /** Money held right now with an undo window open. */
  heldNow: number;
};

export const merchantKpisSchema: Schema<MerchantKpis> = s.object<MerchantKpis>({
  agentOrders: s.int(),
  undone: s.int(),
  feesAvoided: s.float64(),
  billedToAgents: s.float64(),
  merchantProtected: s.int(),
  needsAction: s.int(),
  heldNow: s.float64(),
});
