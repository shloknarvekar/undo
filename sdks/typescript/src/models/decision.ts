import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { evidenceItemSchema, type EvidenceItem } from "./evidence-item.js";
import { liabilitySchema, type Liability } from "./liability.js";
import { verdictSchema, type Verdict } from "./verdict.js";

/** The fault check's verdict, who pays, and the evidence behind it. */
export type Decision = {
  /** Who was at fault. */
  verdict: Verdict;
  /** How sure the fault check is, from 0 to 1. Below 0.7 goes to a person. */
  confidence: number;
  /** Who pays. Null when a person still has to decide. */
  liability: Liability | null;
  /** Each finding behind the verdict and where it came from. */
  evidence: EvidenceItem[];
};

export const decisionSchema: Schema<Decision> = s.object<Decision>({
  verdict: verdictSchema,
  confidence: s.float64(),
  liability: s.nullable(s.lazy(() => liabilitySchema)),
  evidence: s.array(s.lazy(() => evidenceItemSchema)),
});
