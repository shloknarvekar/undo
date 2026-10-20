import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Always answer. */
export const AnswerActionName = {
  Answer: "answer",
} as const;
export type AnswerActionName = (typeof AnswerActionName)[keyof typeof AnswerActionName] | (string & {});

export const answerActionNameSchema: EnumSchema<AnswerActionName> =
  s.enumOf<AnswerActionName>(AnswerActionName);
