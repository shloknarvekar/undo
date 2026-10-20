import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** What the store's rules do to this agent's next purchase. */
export type RuleEffect = {
  /** Why the agent would be refused, or null. */
  blocked: string | null;
  /** Extra undo-window minutes the rules add. */
  extraMinutes: number;
  /** Which rule added the time, or null. */
  reason?: string | null;
};

export const ruleEffectSchema: Schema<RuleEffect> = s.object<RuleEffect>({
  blocked: s.nullable(s.string()),
  extraMinutes: s.int(),
  reason: s.optionalNullable(s.string()),
});
