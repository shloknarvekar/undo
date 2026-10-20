import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { intentMandateSchema, type IntentMandate } from "./intent-mandate.js";

/** Store the signed mandate. */
export type SignAction = {
  /** Always sign. @default "sign" */
  action?: "sign";
  /**
   * What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing
   * message.
   */
  mandate: IntentMandate;
  /** Base64 Ed25519 signature of the signingMessage returned by prepare. */
  signature: string;
};

export const signActionSchema: Schema<SignAction> = s.object<SignAction>({
  action: s.defaulted(s.literal("sign"), "sign"),
  mandate: intentMandateSchema,
  signature: s.string(),
});
