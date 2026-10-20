import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { payWithSchema, type PayWith } from "./pay-with.js";

/** Build the exact mandate this device will sign. */
export type PrepareAction = {
  /** Always prepare. @default "prepare" */
  action?: "prepare";
  /** Base64 Ed25519 public key of the device that will sign. */
  shopperKey: string;
  /** How the agent may pay. */
  payWith?: PayWith;
};

export const prepareActionSchema: Schema<PrepareAction> = s.object<PrepareAction>({
  action: s.defaulted(s.literal("prepare"), "prepare"),
  shopperKey: s.string(),
  payWith: s.optional(s.lazy(() => payWithSchema)),
});
