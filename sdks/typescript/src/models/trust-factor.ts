import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** One part of an agent's trust score. */
export type TrustFactor = {
  /** What earned or cost points. */
  label: string;
  /** Points added (negative when taken away). */
  points: number;
};

export const trustFactorSchema: Schema<TrustFactor> = s.object<TrustFactor>({
  label: s.string(),
  points: s.int(),
});
