import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Demo agents that misbehave on purpose. */
export const SimulateMode = {
  UnguardedWrongVariant: "unguarded_wrong_variant",
} as const;
export type SimulateMode = (typeof SimulateMode)[keyof typeof SimulateMode] | (string & {});

export const simulateModeSchema: EnumSchema<SimulateMode> = s.enumOf<SimulateMode>(SimulateMode);
