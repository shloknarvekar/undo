import * as s from "../../core/validation/index.js";
import type { Schema } from "../../core/validation/schema.js";
import { answerActionSchema, type AnswerAction } from "../answer-action.js";
import { prepareActionSchema, type PrepareAction } from "../prepare-action.js";
import { signActionSchema, type SignAction } from "../sign-action.js";

/** One of answer, prepare or sign, chosen by action. */
export type MandateRequestAction =
  | (AnswerAction & { action: "answer" })
  | (PrepareAction & { action: "prepare" })
  | (SignAction & { action: "sign" });

export const mandateRequestActionSchema: Schema<MandateRequestAction> =
  s.discriminatedUnion<MandateRequestAction>("action", {
    answer: answerActionSchema,
    prepare: prepareActionSchema,
    sign: signActionSchema,
  });
