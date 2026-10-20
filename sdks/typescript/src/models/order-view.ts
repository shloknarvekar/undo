import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { eventChainSchema, type EventChain } from "./event-chain.js";
import { mandateSummarySchema, type MandateSummary } from "./mandate-summary.js";
import { orderSchema, type Order } from "./order.js";
import { undoWindowStatusSchema, type UndoWindowStatus } from "./undo-window-status.js";

/** An order, its undo window, its mandate and its verified event chain. */
export type OrderView = {
  /** The purchase. */
  order: Order;
  /** The undo window on an order: how long, why, and whether it is still open. */
  undoWindow: UndoWindowStatus;
  /** The mandate this purchase was made under. */
  mandate?: MandateSummary;
  /** The mandate's event chain, with a proof on every step. */
  chain: EventChain;
};

export const orderViewSchema: Schema<OrderView> = s.object<OrderView>({
  order: orderSchema,
  undoWindow: undoWindowStatusSchema,
  mandate: s.optional(s.lazy(() => mandateSummarySchema)),
  chain: eventChainSchema,
});
