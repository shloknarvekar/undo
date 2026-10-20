import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { agentRefSchema, type AgentRef } from "./agent-ref.js";
import { intentDraftSchema, type IntentDraft } from "./intent-draft.js";
import { payWithSchema, type PayWith } from "./pay-with.js";

/**
 * What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing
 * message.
 */
export type IntentMandate = {
  /** Mandate format version. Always 1. */
  version: number;
  /** Mandate id, chosen when it was prepared. */
  id: string;
  /** When the mandate was prepared. */
  createdAt: Date;
  /** When the mandate stops working (14 days after it was prepared). */
  expiresAt: Date;
  /** Base64 Ed25519 public key (32 bytes). */
  shopperKey: string;
  /** The shopper's own words, verbatim. */
  request: string;
  /** The shopper's limits in structured form. */
  intent: IntentDraft;
  /** The agent a mandate authorizes. Inside the signed bytes, so liability follows the name. */
  agent?: AgentRef;
  /** How the agent may pay. */
  payWith?: PayWith;
};

export const intentMandateSchema: Schema<IntentMandate> = s.object<IntentMandate>({
  version: s.int(),
  id: s.string(),
  createdAt: s.dateTime(),
  expiresAt: s.dateTime(),
  shopperKey: s.string(),
  request: s.string(),
  intent: intentDraftSchema,
  agent: s.optional(s.lazy(() => agentRefSchema)),
  payWith: s.optional(s.lazy(() => payWithSchema)),
});
