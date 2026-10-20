import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** Answer the agent's open questions. */
export type AnswerAction = {
  /** Always answer. @default "answer" */
  action?: "answer";
  /** Each open question (exactly as asked) mapped to the shopper's answer. */
  answers: Record<string, string>;
};

export const answerActionSchema: Schema<AnswerAction> = s.object<AnswerAction>({
  action: s.defaulted(s.literal("answer"), "answer"),
  answers: s.record(s.string(), s.string()),
});
