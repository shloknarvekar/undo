/**
 * Phone photo handoff: the order page on the shopper's computer shows a QR code; their phone opens it, takes a photo
 * of what arrived and sends it; the computer collects it and attaches it to the undo form.
 *
 * The phone never signs anything and can't undo on its own. The photo only counts as evidence once the shopper's
 * device key (on the computer) signs an undo over its SHA-256, exactly as with a photo picked from a file. Links are
 * one-time, last 15 minutes, and only the token's hash is stored. The photo is cleared once the computer collects it.
 */
import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getDb, schema } from "@/db";

export const HANDOFF_MINUTES = 15;
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const PHOTO_DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const UNDOABLE = new Set(["AUTHORIZED", "CAPTURED"]);

export const hashToken = (token: string) => createHash("sha256").update(token, "utf8").digest("hex");

/** Bytes and SHA-256 of a photo data URL: the same hash the computer signs and the undo route recomputes. */
export function photoDigest(dataUrl: string): { bytes: Buffer; sha256: string } {
  const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  return { bytes, sha256: createHash("sha256").update(bytes).digest("hex") };
}

export type HandoffError = "not_found" | "not_undoable" | "expired" | "already_sent" | "bad_photo" | "photo_too_large";

/** A new one-time link for this order, with its QR code as an SVG string. */
export async function createHandoff(orderId: string, baseUrl: string) {
  const [order] = await getDb().select({ status: schema.orders.status }).from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!order) return { error: "not_found" as const };
  if (!UNDOABLE.has(order.status)) return { error: "not_undoable" as const };
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + HANDOFF_MINUTES * 60_000);
  await getDb().insert(schema.photoHandoffs).values({ id: hashToken(token), orderId, expiresAt });
  const url = `${baseUrl}/orders/${orderId}/photo?t=${token}`;
  const qrSvg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#000000", light: "#ffffff" } });
  return { token, url, qrSvg, expiresAt: expiresAt.toISOString() };
}

async function load(orderId: string, token: string) {
  const [h] = await getDb()
    .select()
    .from(schema.photoHandoffs)
    .where(and(eq(schema.photoHandoffs.id, hashToken(token)), eq(schema.photoHandoffs.orderId, orderId)))
    .limit(1);
  return h ?? null;
}

/** Whether the phone can still send on this link. Read-only: the phone asks before it offers the camera. */
export async function checkHandoff(orderId: string, token: string): Promise<{ ok: true; expiresAt: string } | { ok: false; error: HandoffError }> {
  const h = await load(orderId, token);
  if (!h) return { ok: false, error: "not_found" };
  if (h.status !== "WAITING") return { ok: false, error: "already_sent" };
  if (h.expiresAt.getTime() < Date.now()) return { ok: false, error: "expired" };
  return { ok: true, expiresAt: h.expiresAt.toISOString() };
}

/** The phone sends its photo. Once per link, before it expires. */
export async function receivePhoto(orderId: string, token: string, dataUrl: string): Promise<{ ok: true } | { ok: false; error: HandoffError }> {
  const h = await load(orderId, token);
  if (!h) return { ok: false, error: "not_found" };
  if (h.expiresAt.getTime() < Date.now()) return { ok: false, error: "expired" };
  if (h.status !== "WAITING") return { ok: false, error: "already_sent" };
  if (!PHOTO_DATA_URL.test(dataUrl)) return { ok: false, error: "bad_photo" };
  const { bytes, sha256 } = photoDigest(dataUrl);
  if (bytes.length > MAX_PHOTO_BYTES) return { ok: false, error: "photo_too_large" };
  await getDb()
    .update(schema.photoHandoffs)
    .set({ status: "READY", dataUrl, sha256 })
    .where(and(eq(schema.photoHandoffs.id, h.id), eq(schema.photoHandoffs.status, "WAITING")));
  return { ok: true };
}

/**
 * The computer asks whether the photo has arrived. The first answer after it arrives carries the photo, and the
 * stored copy is cleared at the same moment (one collection only).
 */
export async function collectPhoto(
  orderId: string,
  token: string,
): Promise<{ status: "waiting" | "used"; expiresAt: string } | { status: "ready"; photo: { dataUrl: string; sha256: string } } | { error: HandoffError }> {
  const h = await load(orderId, token);
  if (!h) return { error: "not_found" };
  if (h.status === "READY" && h.dataUrl && h.sha256) {
    const [taken] = await getDb()
      .update(schema.photoHandoffs)
      .set({ status: "USED", dataUrl: null })
      .where(and(eq(schema.photoHandoffs.id, h.id), eq(schema.photoHandoffs.status, "READY")))
      .returning({ id: schema.photoHandoffs.id });
    if (taken) return { status: "ready", photo: { dataUrl: h.dataUrl, sha256: h.sha256 } };
    return { status: "used", expiresAt: h.expiresAt.toISOString() };
  }
  if (h.status === "USED") return { status: "used", expiresAt: h.expiresAt.toISOString() };
  if (h.expiresAt.getTime() < Date.now()) return { error: "expired" };
  return { status: "waiting", expiresAt: h.expiresAt.toISOString() };
}
