import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { simulateModeSchema, type SimulateMode } from "./simulate-mode.js";

/** Options for a shopping run. Send an empty object for a normal run. */
export type ShopMandateRequest = {
  /** Demo agents that misbehave on purpose. */
  simulate?: SimulateMode;
};

export const shopMandateRequestSchema: Schema<ShopMandateRequest> = s.object<ShopMandateRequest>({
  simulate: s.optional(s.lazy(() => simulateModeSchema)),
});
