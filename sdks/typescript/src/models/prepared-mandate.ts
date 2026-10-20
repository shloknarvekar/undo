import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { intentMandateSchema, type IntentMandate } from "./intent-mandate.js";

/** The mandate to sign and the exact string to sign. */
export type PreparedMandate = {
  /**
   * What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing
   * message.
   */
  mandate: IntentMandate;
  /** Sign these exact UTF-8 bytes with the shopper's Ed25519 key. */
  signingMessage: string;
};

export const preparedMandateSchema: Schema<PreparedMandate> = s.object<PreparedMandate>({
  mandate: intentMandateSchema,
  signingMessage: s.string(),
});
