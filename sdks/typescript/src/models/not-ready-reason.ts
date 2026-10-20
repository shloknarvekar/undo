import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Why a draft can't be signed yet. */
export const NotReadyReason = {
  OpenQuestions: "open_questions",
  MissingBudget: "missing_budget",
} as const;
export type NotReadyReason = (typeof NotReadyReason)[keyof typeof NotReadyReason] | (string & {});

export const notReadyReasonSchema: EnumSchema<NotReadyReason> = s.enumOf<NotReadyReason>(NotReadyReason);
