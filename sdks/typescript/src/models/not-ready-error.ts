import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { notReadyReasonSchema, type NotReadyReason } from "./not-ready-reason.js";

/** The draft can't be turned into a mandate yet. */
export type NotReadyError = {
  /** Why a draft can't be signed yet. */
  error: NotReadyReason;
  /** The questions still to answer. */
  mustAsk?: string[];
};

export const notReadyErrorSchema: Schema<NotReadyError> = s.object<NotReadyError>({
  error: notReadyReasonSchema,
  mustAsk: s.optional(s.array(s.string())),
});
