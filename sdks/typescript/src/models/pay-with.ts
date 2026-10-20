import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** How the agent may pay. */
export const PayWith = {
  SavedWallet: "saved_wallet",
} as const;
export type PayWith = (typeof PayWith)[keyof typeof PayWith] | (string & {});

export const payWithSchema: EnumSchema<PayWith> = s.enumOf<PayWith>(PayWith);
