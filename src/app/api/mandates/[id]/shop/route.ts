import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { runAgent, NoCompliantProduct } from "@/lib/agent";
import { undoWindow } from "@/lib/agent-core";
import { AiUnavailable } from "@/lib/ai";
import { appendEvent } from "@/lib/events";
import { approveLink, paypal, PayPalError } from "@/lib/paypal";
import { loadMandate, publicBaseUrl } from "@/lib/store";

/**
 * POST /api/mandates/:id/shop { simulate? } → the agent shops within the mandate and opens a PayPal checkout
 * in AUTHORIZE mode. Returns the approval link the shopper follows to approve the payment in PayPal.
 * One live purchase per mandate: a second call while one is open returns 409.
 */
const Body = z.object({ simulate: z.enum(["unguarded_wrong_variant"]).optional() }).default({});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });

  const loaded = await loadMandate(id);
  if (!loaded) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (loaded.status !== "ACTIVE") return NextResponse.json({ error: `mandate_${loaded.status.toLowerCase()}` }, { status: 409 });
  const { mandate } = loaded;

  const db = getDb();
  const open = await db
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(and(eq(schema.orders.mandateId, id), inArray(schema.orders.status, ["CHECKOUT_CREATED", "AUTHORIZED", "CAPTURED"])))
    .limit(1);
  if (open.length) return NextResponse.json({ error: "purchase_already_open", orderId: open[0].id }, { status: 409 });

  let decision;
  try {
    decision = await runAgent(mandate, { simulate: parsed.data.simulate });
  } catch (err) {
    if (err instanceof NoCompliantProduct) {
      await appendEvent(id, "AGENT_NO_MATCH", { considered: err.considered });
      return NextResponse.json({ error: "no_compliant_product", considered: err.considered }, { status: 422 });
    }
    if (err instanceof AiUnavailable) return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
    console.error("agent failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "agent_failed" }, { status: 502 });
  }

  const { chosen } = decision;
  const quantity = mandate.intent.quantity;
  const unitPrice = chosen.product.price.toFixed(2);
  const window = undoWindow({
    price: chosen.product.price,
    quantity,
    confidence: decision.confidence,
    approximate: chosen.match.approximate.length,
    unverifiable: chosen.match.unverifiable.length, // decision.unverified also lists the approximate ones; don't count twice
    relaxed: decision.guard.relaxed.length,
    guardBypassed: decision.guard.bypassed,
  });

  const orderId = randomUUID();
  const agent = {
    reasoning: decision.reasoning,
    confidence: decision.confidence,
    unverified: decision.unverified,
    guard: decision.guard,
    requested: chosen.match.requested,
    approximate: chosen.match.approximate,
    considered: decision.considered,
    searches: decision.searches,
    model: decision.model,
    ...(parsed.data.simulate ? { simulated: parsed.data.simulate } : {}),
  };
  await db.insert(schema.orders).values({
    id: orderId,
    mandateId: id,
    status: "CHECKOUT_CREATED",
    amount: (Number(unitPrice) * quantity).toFixed(2),
    currency: chosen.product.currency,
    quantity,
    product: chosen.product,
    agent,
    risk: window,
  });
  await appendEvent(id, "CART_PROPOSED", { orderId, product: chosen.product, quantity, agent, risk: window });

  const base = publicBaseUrl(req);
  try {
    const order = await paypal.createAgentOrder({
      undoOrderId: orderId,
      item: {
        name: chosen.product.title,
        sku: chosen.product.channel3Id,
        quantity,
        unitPrice,
        currency: chosen.product.currency,
        url: chosen.product.sourceUrl,
        imageUrl: chosen.product.imageUrl ?? undefined,
      },
      returnUrl: `${base}/api/checkout/return?order=${orderId}`,
      cancelUrl: `${base}/api/checkout/cancel?order=${orderId}`,
    });
    await db.update(schema.orders).set({ paypalOrderId: order.id, updatedAt: new Date() }).where(eq(schema.orders.id, orderId));
    await appendEvent(id, "CHECKOUT_CREATED", { orderId, paypalOrderId: order.id, intent: "AUTHORIZE", amount: (Number(unitPrice) * quantity).toFixed(2), currency: chosen.product.currency });

    return NextResponse.json(
      {
        orderId,
        approveUrl: approveLink(order),
        cart: { title: chosen.product.title, brand: chosen.product.brand, variant: chosen.product.variant, price: chosen.product.price, currency: chosen.product.currency, quantity, retailer: chosen.product.sourceDomain },
        agent: { reasoning: decision.reasoning, confidence: decision.confidence, unverified: decision.unverified, guard: decision.guard, considered: decision.considered },
        undoWindow: window,
      },
      { status: 201 },
    );
  } catch (err) {
    await db.update(schema.orders).set({ status: "FAILED", updatedAt: new Date() }).where(eq(schema.orders.id, orderId));
    await appendEvent(id, "CHECKOUT_FAILED", { orderId, error: err instanceof PayPalError ? err.message : String(err) });
    return NextResponse.json({ error: "paypal_checkout_failed", detail: err instanceof PayPalError ? err.message : undefined }, { status: 502 });
  }
}
