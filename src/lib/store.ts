/**
 * Server-side helpers shared by the mandate, shop, checkout and order routes.
 */
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { verifySignature } from "./crypto";
import { appendEvent } from "./events";
import { AgentRef, IntentDraft, IntentMandate, signingMessage, verifyMandate } from "./mandate";

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

/**
 * Stores a shopper-signed mandate after re-checking everything (signature, freshness, expiry, readiness) and
 * writes the first link of its hash chain. Used by the web shop and by agent mandate requests alike.
 */
export async function storeSignedMandate(mandate: IntentMandate, signature: string) {
  const check = verifyMandate(mandate, signature);
  if (!check.ok) return { ok: false as const, error: check.reason, status: 422 };
  const inserted = await getDb()
    .insert(schema.mandates)
    .values({ id: mandate.id, shopperKey: mandate.shopperKey, mandate, digest: check.digest, signature, expiresAt: new Date(mandate.expiresAt) })
    .onConflictDoNothing()
    .returning({ id: schema.mandates.id });
  if (!inserted.length) return { ok: false as const, error: "mandate_exists", status: 409 };
  const event = await appendEvent(mandate.id, "MANDATE_SIGNED", { digest: check.digest, signature, ...(mandate.agent ? { agent: mandate.agent } : {}) });
  return { ok: true as const, digest: check.digest, event };
}

/** A pending mandate an outside agent asked for lives this long before the shopper must sign it. */
const MANDATE_REQUEST_TTL_HOURS = 24;

export async function createMandateRequest(request: string, draft: IntentDraft, agent: AgentRef) {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + MANDATE_REQUEST_TTL_HOURS * 3_600_000);
  await getDb().insert(schema.mandateRequests).values({ id, request, draft, agent, expiresAt });
  return { id, expiresAt };
}

export async function loadMandateRequest(id: string) {
  if (!UUID.test(id)) return null;
  const [row] = await getDb().select().from(schema.mandateRequests).where(eq(schema.mandateRequests.id, id)).limit(1);
  if (!row) return null;
  const status = row.status === "PENDING" && row.expiresAt.getTime() <= Date.now() ? ("EXPIRED" as const) : row.status;
  return { ...row, status, draft: IntentDraft.parse(row.draft), agent: AgentRef.parse(row.agent) };
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
