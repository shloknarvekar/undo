import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** A fresh check, run on every read. */
export type IntegrityCheck = {
  /** The stored digest matches the mandate recomputed now. */
  digestMatches: boolean;
  /** The shopper's signature verifies against the mandate. */
  signatureValid: boolean;
  /** Every event's hash links correctly to the one before. */
  chainIntact: boolean;
  /** The first event whose hash doesn't link, when the chain is broken. */
  chainBrokenAt?: number;
};

export const integrityCheckSchema: Schema<IntegrityCheck> = s.object<IntegrityCheck>({
  digestMatches: s.boolean(),
  signatureValid: s.boolean(),
  chainIntact: s.boolean(),
  chainBrokenAt: s.optional(s.int()),
});
