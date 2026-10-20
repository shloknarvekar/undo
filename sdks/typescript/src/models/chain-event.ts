import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** One event in the hash chain, with the proof of how it was decided. */
export type ChainEvent = {
  /** Position in the hash chain, starting at 1. */
  seq: number;
  /** Event type, for example MANDATE_SIGNED or PAYMENT_VOIDED. */
  type: string;
  /** When it was created (ISO 8601, UTC). */
  createdAt: Date;
  /** SHA-256 of this event chained to the previous event's hash. */
  hash: string;
  /** How this step was decided, and the PayPal call or id behind it. */
  proof: Record<string, unknown>;
};

export const chainEventSchema: Schema<ChainEvent> = s.object<ChainEvent>({
  seq: s.int(),
  type: s.string(),
  createdAt: s.dateTime(),
  hash: s.string(),
  proof: s.record(s.string(), s.unknown()),
});
