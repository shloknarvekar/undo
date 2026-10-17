import { NextResponse } from "next/server";
import { webhooks, type WebhookEvent } from "@/lib/paypal";

/**
 * POST /api/webhooks/paypal — PayPal event receiver.
 * Every delivery is checked with PayPal's verify-webhook-signature API before it is trusted.
 * The webhook id comes from PAYPAL_WEBHOOK_ID, or is looked up once by matching this route's URL
 * among the app's registered webhooks (so no extra secret has to be configured on the host).
 *
 * GET /api/webhooks/paypal — last few deliveries (id, type, verified) for debugging. No payloads.
 * Kept in memory until the database lands; resets when the instance restarts.
 */

type Delivery = { id: string; type: string; resource: string | null; verified: boolean; receivedAt: string };
const recent: Delivery[] = [];
let webhookId: string | null = process.env.PAYPAL_WEBHOOK_ID ?? null;

async function resolveWebhookId(req: Request): Promise<string | null> {
  if (webhookId) return webhookId;
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const url = `${proto}://${host}/api/webhooks/paypal`;
  const { webhooks: registered } = await webhooks.list();
  webhookId = registered.find((w) => w.url === url)?.id ?? null;
  return webhookId;
}

export async function POST(req: Request) {
  let event: WebhookEvent;
  try {
    event = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const id = await resolveWebhookId(req);
  const verified = id ? await webhooks.verify(req.headers, event, id).catch(() => false) : false;

  recent.unshift({
    id: event.id,
    type: event.event_type,
    resource: event.resource?.id ?? null,
    verified,
    receivedAt: new Date().toISOString(),
  });
  recent.length = Math.min(recent.length, 25);

  if (!verified) {
    // 400 makes PayPal retry; a forged request just gets nothing.
    return NextResponse.json({ error: "signature_not_verified" }, { status: 400 });
  }

  // Event handling (order/dispute state updates) lands with the database.
  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ webhookId: webhookId ? `${webhookId.slice(0, 6)}…` : null, recent });
}
