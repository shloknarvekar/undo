import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** An Undo, signed by the shopper's device key. */
export type UndoRequest = {
  /** What went wrong, in the shopper's words. */
  reason: string;
  /** Optional photo of what arrived, as a base64 JPEG, PNG or WebP data URL (max 4 MB). */
  photo?: string;
  /** When the shopper pressed Undo. Must be within 15 minutes of the server's clock. */
  requestedAt: Date;
  /** Base64 Ed25519 signature of the undo signing message. */
  signature: string;
};

export const undoRequestSchema: Schema<UndoRequest> = s.object<UndoRequest>({
  reason: s.string(),
  photo: s.optional(s.string()),
  requestedAt: s.dateTime(),
  signature: s.string(),
});
