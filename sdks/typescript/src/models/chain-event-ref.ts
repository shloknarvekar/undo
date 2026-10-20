import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** The first event in the mandate's hash chain (MANDATE_SIGNED). */
export type ChainEventRef = {
  /** Position in the hash chain, starting at 1. */
  seq: number;
  /** SHA-256 of this event chained to the previous event's hash. */
  hash: string;
};

export const chainEventRefSchema: Schema<ChainEventRef> = s.object<ChainEventRef>({
  seq: s.int(),
  hash: s.string(),
});
