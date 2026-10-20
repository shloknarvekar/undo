import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { chainEventSummarySchema, type ChainEventSummary } from "./chain-event-summary.js";
import { integrityCheckSchema, type IntegrityCheck } from "./integrity-check.js";
import { intentMandateSchema, type IntentMandate } from "./intent-mandate.js";
import { mandateStatusSchema, type MandateStatus } from "./mandate-status.js";

/** A mandate with its status, the search it permits, and a fresh integrity check. */
export type MandateView = {
  /**
   * What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing
   * message.
   */
  mandate: IntentMandate;
  /** Where a mandate stands. */
  status: MandateStatus;
  /** The product search this mandate permits. */
  search: Record<string, unknown>;
  /** A fresh check, run on every read. */
  integrity: IntegrityCheck;
  /** The mandate's event chain, oldest first. */
  events: ChainEventSummary[];
};

export const mandateViewSchema: Schema<MandateView> = s.object<MandateView>({
  mandate: intentMandateSchema,
  status: mandateStatusSchema,
  search: s.record(s.string(), s.unknown()),
  integrity: integrityCheckSchema,
  events: s.array(s.lazy(() => chainEventSummarySchema)),
});
