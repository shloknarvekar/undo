import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { agentRefSchema, type AgentRef } from "./agent-ref.js";
import { intentDraftSchema, type IntentDraft } from "./intent-draft.js";
import { mandateRequestStatusSchema, type MandateRequestStatus } from "./mandate-request-status.js";
import { readyCheckSchema, type ReadyCheck } from "./ready-check.js";

/** A mandate an outside agent asked the shopper to sign. */
export type MandateRequest = {
  /** Mandate request id. */
  id: string;
  /** The request as the agent passed it on, plus any answers. */
  request: string;
  /** The shopper's limits in structured form. */
  draft: IntentDraft;
  /** Whether a draft can be signed as is. */
  ready: ReadyCheck;
  /** The agent a mandate authorizes. Inside the signed bytes, so liability follows the name. */
  agent: AgentRef;
  /** Where a mandate request stands. */
  status: MandateRequestStatus;
  /** The signed mandate, once there is one. */
  mandateId?: string | null;
  /** When the request stops accepting a signature. */
  expiresAt: Date;
};

export const mandateRequestSchema: Schema<MandateRequest> = s.object<MandateRequest>({
  id: s.string(),
  request: s.string(),
  draft: intentDraftSchema,
  ready: readyCheckSchema,
  agent: agentRefSchema,
  status: mandateRequestStatusSchema,
  mandateId: s.optionalNullable(s.string()),
  expiresAt: s.dateTime(),
});
