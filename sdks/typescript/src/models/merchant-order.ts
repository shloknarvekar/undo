import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { orderStatusSchema, type OrderStatus } from "./order-status.js";

/** One agent order as the store sees it. */
export type MerchantOrder = {
  /** Undo order id. */
  id: string;
  /** When the agent placed the order. */
  createdAt: Date;
  /** Where an order stands. AUTHORIZED means the money is only held and Undo is a free void. */
  status: OrderStatus;
  /** Order total. */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Product title. */
  product: string;
  /** Brand name, when known. */
  brand?: string | null;
  /** The variant bought, for example Size M · Color Black. */
  variant?: string;
  /** Product image URL, when there is one. */
  imageUrl?: string | null;
  /** The retailer's domain. */
  retailer?: string | null;
  /** The shopper's mandate, in their words. */
  request?: string | null;
  /** How sure the agent was that the item fits, from 0 to 1. */
  agentConfidence?: number | null;
  /** True when the agent skipped Undo's checks before buying. */
  guardBypassed?: boolean;
  /** Set on demo orders from the careless test agent. */
  simulated?: string | null;
  /** The agent operator's name. */
  agentName: string;
  /** Whether the operator presented a registered key. */
  agentVerified: boolean;
  /** How the agent connected: web or mcp. */
  agentVia?: string;
  /** The fault check's verdict, after an Undo. */
  verdict?: string | null;
  /** How sure the verdict is, from 0 to 1. */
  verdictConfidence?: number | null;
  /** Who pays: agent_operator, merchant or shopper. */
  liability?: string | null;
  /** Status of the agent operator's payout to the store, when one was due. */
  settlement?: string | null;
  /** Money that arrived from an agent operator through PayPal Payouts. */
  settledAmount?: number;
  /** What happened to the money, for example VOID or REFUND_FULL. */
  action?: string | null;
  /** When the undo window closes or closed. */
  windowEndsAt?: Date | null;
  /** Minutes left in the undo window, while the money is held. */
  windowMinutesLeft?: number | null;
  /** The most specific PayPal id: capture, then authorization, then order. */
  paypalRef?: string | null;
};

export const merchantOrderSchema: Schema<MerchantOrder> = s.object<MerchantOrder>({
  id: s.string(),
  createdAt: s.dateTime(),
  status: orderStatusSchema,
  amount: s.float64(),
  currency: s.string(),
  product: s.string(),
  brand: s.optionalNullable(s.string()),
  variant: s.optional(s.string()),
  imageUrl: s.optionalNullable(s.string()),
  retailer: s.optionalNullable(s.string()),
  request: s.optionalNullable(s.string()),
  agentConfidence: s.optionalNullable(s.float64()),
  guardBypassed: s.optional(s.boolean()),
  simulated: s.optionalNullable(s.string()),
  agentName: s.string(),
  agentVerified: s.boolean(),
  agentVia: s.optional(s.string()),
  verdict: s.optionalNullable(s.string()),
  verdictConfidence: s.optionalNullable(s.float64()),
  liability: s.optionalNullable(s.string()),
  settlement: s.optionalNullable(s.string()),
  settledAmount: s.optional(s.float64()),
  action: s.optionalNullable(s.string()),
  windowEndsAt: s.optionalNullable(s.dateTime()),
  windowMinutesLeft: s.optionalNullable(s.int()),
  paypalRef: s.optionalNullable(s.string()),
});
