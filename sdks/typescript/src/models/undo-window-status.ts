import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { undoWindowFactorSchema, type UndoWindowFactor } from "./undo-window-factor.js";

/** The undo window on an order: how long, why, and whether it is still open. */
export type UndoWindowStatus = {
  /** Total window length. */
  minutes: number;
  /** Why the window is this long, factor by factor. */
  factors: UndoWindowFactor[];
  /** When the window closes. */
  endsAt?: Date | null;
  /** True while the money is only held and the window hasn't closed: Undo is a free void. */
  open: boolean;
  /** Minutes until the window closes. */
  minutesLeft?: number | null;
};

export const undoWindowStatusSchema: Schema<UndoWindowStatus> = s.object<UndoWindowStatus>({
  minutes: s.int(),
  factors: s.array(s.lazy(() => undoWindowFactorSchema)),
  endsAt: s.optionalNullable(s.dateTime()),
  open: s.boolean(),
  minutesLeft: s.optionalNullable(s.int()),
});
