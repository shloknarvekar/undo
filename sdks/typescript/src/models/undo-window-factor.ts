import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** One reason the undo window is as long as it is. */
export type UndoWindowFactor = {
  /** What added time, in plain words. */
  factor: string;
  /** Minutes it added. */
  minutes: number;
};

export const undoWindowFactorSchema: Schema<UndoWindowFactor> = s.object<UndoWindowFactor>({
  factor: s.string(),
  minutes: s.int(),
});
