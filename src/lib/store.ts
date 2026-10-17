/**
 * Server-side helpers shared by the mandate, shop, checkout and order routes.
 */
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { verifySignature } from "./crypto";
import { IntentMandate, signingMessage } from "./mandate";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Loads a stored mandate and re-checks the shopper's signature: a row edited in the DB is treated as gone. */
export async function loadMandate(id: string) {
  if (!UUID.test(id)) return null;
  const [row] = await getDb().select().from(schema.mandates).where(eq(schema.mandates.id, id)).limit(1);
  if (!row) return null;
  const mandate = IntentMandate.parse(row.mandate);
  if (!verifySignature(mandate.shopperKey, signingMessage(mandate), row.signature)) return null;
  const expired = Date.parse(mandate.expiresAt) <= Date.now();
  return { row, mandate, status: expired && row.status === "ACTIVE" ? ("EXPIRED" as const) : row.status };
}

export async function loadOrder(id: string) {
  if (!UUID.test(id)) return null;
  const [row] = await getDb().select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  return row ?? null;
}

/** Public origin for PayPal return URLs: Render's own URL in production, else the request's origin. */
export function publicBaseUrl(req: Request): string {
  const configured = process.env.APP_URL ?? process.env.RENDER_EXTERNAL_URL;
  if (configured) return configured.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host;
  return `${proto}://${host}`;
}
