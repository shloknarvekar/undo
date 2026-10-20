import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** One recorded step in the store's activity. */
export type ActivityEvent = {
  /** Event id. Pass the newest one as after to get only newer events. */
  id: number;
  /** When it happened. */
  at: Date;
  /** Event type, for example PAYMENT_VOIDED. */
  type: string;
  /** Who or what decided this step: shopper, agent, rules, AI or PayPal. */
  kind: string;
  /** How the step was decided, in plain words. */
  how: string;
  /** The order it belongs to, when there is one. */
  orderId?: string | null;
  /** Money involved, when there is any. */
  amount?: number | null;
  /** The agent operator involved, when there is one. */
  agent?: string | null;
  /** The PayPal id or call behind the step, when there is one. */
  ref?: string | null;
};

export const activityEventSchema: Schema<ActivityEvent> = s.object<ActivityEvent>({
  id: s.int(),
  at: s.dateTime(),
  type: s.string(),
  kind: s.string(),
  how: s.string(),
  orderId: s.optionalNullable(s.string()),
  amount: s.optionalNullable(s.float64()),
  agent: s.optionalNullable(s.string()),
  ref: s.optionalNullable(s.string()),
});
