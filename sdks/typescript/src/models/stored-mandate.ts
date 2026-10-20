import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { chainEventRefSchema, type ChainEventRef } from "./chain-event-ref.js";

/** A stored mandate and the first event of its hash chain. */
export type StoredMandate = {
  /** The stored mandate's id. */
  id: string;
  /** SHA-256 (hex) of the mandate's canonical JSON. */
  digest: string;
  /** The first event in the mandate's hash chain (MANDATE_SIGNED). */
  event: ChainEventRef;
};

export const storedMandateSchema: Schema<StoredMandate> = s.object<StoredMandate>({
  id: s.string(),
  digest: s.string(),
  event: chainEventRefSchema,
});
