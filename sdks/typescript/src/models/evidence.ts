import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** Everything needed to verify an order without trusting Undo. */
export type Evidence = {
  /** Evidence file format. @default "undo-evidence-v1" */
  format?: "undo-evidence-v1";
  /** The order this evidence is for. */
  orderId: string;
  /** The signed mandate exactly as stored. */
  mandate: Record<string, unknown> | null;
  /** Raw events exactly as hashed. Each hash covers the previous hash and the canonical payload. */
  events: Record<string, unknown>[];
};

export const evidenceSchema: Schema<Evidence> = s.object<Evidence>({
  format: s.defaulted(s.literal("undo-evidence-v1"), "undo-evidence-v1"),
  orderId: s.string(),
  mandate: s.nullable(s.record(s.string(), s.unknown())),
  events: s.array(s.record(s.string(), s.unknown())),
});
