import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { evidenceSourceSchema, type EvidenceSource } from "./evidence-source.js";

/** One finding behind a verdict and where it came from. */
export type EvidenceItem = {
  /** Where a finding came from. */
  source: EvidenceSource;
  /** The finding, in plain words. */
  finding: string;
};

export const evidenceItemSchema: Schema<EvidenceItem> = s.object<EvidenceItem>({
  source: evidenceSourceSchema,
  finding: s.string(),
});
