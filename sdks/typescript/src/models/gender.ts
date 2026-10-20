import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Men's or women's products. */
export const Gender = {
  Male: "male",
  Female: "female",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender] | (string & {});

export const genderSchema: EnumSchema<Gender> = s.enumOf<Gender>(Gender);
