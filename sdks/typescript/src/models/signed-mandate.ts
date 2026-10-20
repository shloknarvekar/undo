import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { intentMandateSchema, type IntentMandate } from "./intent-mandate.js";

/** A mandate and the shopper's signature over its signing message. */
export type SignedMandate = {
  /**
   * What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing
   * message.
   */
  mandate: IntentMandate;
  /** Base64 Ed25519 signature of the signing message. */
  signature: string;
};

export const signedMandateSchema: Schema<SignedMandate> = s.object<SignedMandate>({
  mandate: intentMandateSchema,
  signature: s.string(),
});
