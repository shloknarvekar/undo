import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** One event in a mandate's hash chain, without its payload. */
export type ChainEventSummary = {
  /** Position in the hash chain, starting at 1. */
  seq: number;
  /** Event type, for example MANDATE_SIGNED or PAYMENT_VOIDED. */
  type: string;
  /** When it was created (ISO 8601, UTC). */
  createdAt: Date;
  /** SHA-256 of this event chained to the previous event's hash. */
  hash: string;
};

export const chainEventSummarySchema: Schema<ChainEventSummary> = s.object<ChainEventSummary>({
  seq: s.int(),
  type: s.string(),
  createdAt: s.dateTime(),
  hash: s.string(),
});
