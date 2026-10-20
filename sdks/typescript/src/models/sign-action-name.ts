import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Always sign. */
export const SignActionName = {
  Sign: "sign",
} as const;
export type SignActionName = (typeof SignActionName)[keyof typeof SignActionName] | (string & {});

export const signActionNameSchema: EnumSchema<SignActionName> = s.enumOf<SignActionName>(SignActionName);
