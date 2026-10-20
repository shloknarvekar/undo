import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Always prepare. */
export const PrepareActionName = {
  Prepare: "prepare",
} as const;
export type PrepareActionName = (typeof PrepareActionName)[keyof typeof PrepareActionName] | (string & {});

export const prepareActionNameSchema: EnumSchema<PrepareActionName> =
  s.enumOf<PrepareActionName>(PrepareActionName);
