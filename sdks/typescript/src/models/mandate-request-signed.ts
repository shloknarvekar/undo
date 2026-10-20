import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** A mandate request that was signed and stored. */
export type MandateRequestSigned = {
  /** The stored mandate's id. */
  mandateId: string;
  /** SHA-256 of the canonical mandate. */
  digest: string;
};

export const mandateRequestSignedSchema: Schema<MandateRequestSigned> = s.object<MandateRequestSigned>({
  mandateId: s.string(),
  digest: s.string(),
});
