import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { undoWindowFactorSchema, type UndoWindowFactor } from "./undo-window-factor.js";

/** How long the shopper can undo for free, and why. */
export type UndoWindow = {
  /** Total window length. */
  minutes: number;
  /** Why the window is this long, factor by factor. */
  factors: UndoWindowFactor[];
};

export const undoWindowSchema: Schema<UndoWindow> = s.object<UndoWindow>({
  minutes: s.int(),
  factors: s.array(s.lazy(() => undoWindowFactorSchema)),
});
