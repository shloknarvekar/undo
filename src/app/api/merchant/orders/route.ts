import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { maybeSweep } from "@/lib/money";
import { operatorOf } from "@/lib/trust";

/**
 * GET /api/merchant/orders — the merchant console feed: every agent order with its verdict, plus KPIs.
 * Sandbox demo store; merchant sign-in comes with production use.
 */
const fee = (amount: number) => amount * 0.0349 + 0.49; // PayPal US checkout fee estimate (shown as an estimate)

type Resolution = { decision?: { verdict?: string; confidence?: number; liability?: string | null }; action?: { type?: string }; settlement?: { status: string; amount: string } } | null;

export async function GET() {
  maybeSweep();
  const rows = await getDb()
    .select({ order: schema.orders, request: sql<string | null>`${schema.mandates.mandate}->>'request'` })
    .from(schema.orders)
    .leftJoin(schema.mandates, eq(schema.orders.mandateId, schema.mandates.id))
    .orderBy(desc(schema.orders.createdAt))
    .limit(300);

  const now = Date.now();
  const orders = rows.map(({ order: o, request }) => {
    const r = o.resolution as Resolution;
    const product = o.product as { title?: string; brand?: string | null; variant?: Record<string, string>; imageUrl?: string | null; sourceDomain?: string };
    const agent = o.agent as { confidence?: number; guard?: { bypassed?: boolean }; simulated?: string };
    const operator = operatorOf(o.agent);
    return {
      id: o.id,
      createdAt: o.createdAt.toISOString(),
      status: o.status,
      amount: Number(o.amount),
      currency: o.currency,
      product: product.title ?? "—",
      brand: product.brand ?? null,
      variant: Object.entries(product.variant ?? {}).map(([k, v]) => `${k} ${v}`).join(" · "),
      imageUrl: product.imageUrl ?? null,
      retailer: product.sourceDomain ?? null,
      request: (request as string | null) ?? null,
      agentConfidence: agent.confidence ?? null,
      guardBypassed: Boolean(agent.guard?.bypassed),
      simulated: agent.simulated ?? null,
      agentName: operator.name,
      agentVerified: operator.verified,
      agentVia: operator.via ?? "web",
      verdict: r?.decision?.verdict ?? null,
      verdictConfidence: r?.decision?.confidence ?? null,
      liability: r?.decision?.liability ?? null,
      settlement: r?.settlement?.status ?? null,
      settledAmount: r?.settlement?.status === "SUCCESS" ? Number(r.settlement.amount) : 0,
      action: r?.action?.type ?? null,
      windowEndsAt: o.windowEndsAt?.toISOString() ?? null,
      windowMinutesLeft: o.status === "AUTHORIZED" && o.windowEndsAt ? Math.max(0, Math.round((o.windowEndsAt.getTime() - now) / 60_000)) : null,
      paypalRef: o.captureId ?? o.authorizationId ?? o.paypalOrderId,
    };
  });

  const placed = orders.filter((o) => !["CHECKOUT_CREATED", "CANCELLED", "FAILED"].includes(o.status));
  const kpis = {
    agentOrders: placed.length,
    undone: placed.filter((o) => o.verdict).length,
    feesAvoided: placed.filter((o) => o.status === "VOIDED").reduce((s, o) => s + fee(o.amount), 0),
    // Only money that actually arrived from an agent operator through Payouts counts.
    billedToAgents: placed.reduce((s, o) => s + o.settledAmount, 0),
    merchantProtected: placed.filter((o) => o.liability === "shopper").length,
    needsAction: orders.filter((o) => ["CLAIM_OPEN", "RETURN_PENDING", "REVIEW"].includes(o.status)).length,
    heldNow: placed.filter((o) => o.status === "AUTHORIZED").reduce((s, o) => s + o.amount, 0),
  };
  return NextResponse.json({ kpis, orders });
}
