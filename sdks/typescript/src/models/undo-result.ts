import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { decisionSchema, type Decision } from "./decision.js";
import { undoOutcomeSchema, type UndoOutcome } from "./undo-outcome.js";

/** The verdict and what happened to the money. */
export type UndoResult = {
  /** The order that was undone. */
  orderId: string;
  /** The fault check's verdict, who pays, and the evidence behind it. */
  decision: Decision;
  /** What happened to the money and the order's new status. */
  outcome: UndoOutcome;
};

export const undoResultSchema: Schema<UndoResult> = s.object<UndoResult>({
  orderId: s.string(),
  decision: decisionSchema,
  outcome: undoOutcomeSchema,
});
