import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { notReadyReasonSchema, type NotReadyReason } from "./not-ready-reason.js";

/** Whether a draft can be signed as is. */
export type ReadyCheck = {
  /** True when the draft can be signed as is. */
  ok: boolean;
  /** Why a draft can't be signed yet. */
  reason?: NotReadyReason;
};

export const readyCheckSchema: Schema<ReadyCheck> = s.object<ReadyCheck>({
  ok: s.boolean(),
  reason: s.optional(s.lazy(() => notReadyReasonSchema)),
});
