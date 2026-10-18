import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent, NoCompliantProduct } from "@/lib/agent";
import { undoWindow } from "@/lib/agent-core";
import { AiUnavailable } from "@/lib/ai";
import { CheckoutFailed, openCheckout, openOrderFor } from "@/lib/checkout";
import { appendEvent } from "@/lib/events";
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

  const openId = await openOrderFor(id);
  if (openId) return NextResponse.json({ error: "purchase_already_open", orderId: openId }, { status: 409 });

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
  const window = undoWindow({
    price: chosen.product.price,
    quantity,
    confidence: decision.confidence,
    approximate: chosen.match.approximate.length,
    unverifiable: chosen.match.unverifiable.length, // decision.unverified also lists the approximate ones; don't count twice
    relaxed: decision.guard.relaxed.length,
    guardBypassed: decision.guard.bypassed,
  });
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
    // The careless demo agent is a stand-in for a third-party agent: liability (and the payout) is billed under its name.
    operator: parsed.data.simulate ? { name: "Careless demo agent", verified: false, via: "web" } : { name: "Undo web agent", verified: true, via: "web" },
    ...(parsed.data.simulate ? { simulated: parsed.data.simulate } : {}),
  };

  try {
    const { orderId, approveUrl } = await openCheckout({ mandateId: id, product: chosen.product, quantity, agent, window, baseUrl: publicBaseUrl(req) });
    return NextResponse.json(
      {
        orderId,
        approveUrl,
        cart: { title: chosen.product.title, brand: chosen.product.brand, variant: chosen.product.variant, price: chosen.product.price, currency: chosen.product.currency, quantity, retailer: chosen.product.sourceDomain, imageUrl: chosen.product.imageUrl },
        agent: { reasoning: decision.reasoning, confidence: decision.confidence, unverified: decision.unverified, guard: decision.guard, considered: decision.considered },
        undoWindow: window,
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: "paypal_checkout_failed", detail: err instanceof CheckoutFailed ? err.message : undefined }, { status: 502 });
  }
}
