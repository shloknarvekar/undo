import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Evidence file format. */
export const EvidenceFormat = {
  UndoEvidenceV1: "undo-evidence-v1",
} as const;
export type EvidenceFormat = (typeof EvidenceFormat)[keyof typeof EvidenceFormat] | (string & {});

export const evidenceFormatSchema: EnumSchema<EvidenceFormat> = s.enumOf<EvidenceFormat>(EvidenceFormat);
