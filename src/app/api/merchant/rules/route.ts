import { NextResponse } from "next/server";
import { appendEvent } from "@/lib/events";
import { MerchantRules, loadRules, saveRules } from "@/lib/trust";
import { limitRoute } from "@/lib/usage";

/**
 * PUT /api/merchant/rules { blockBelow, extendBelow, extendMinutes, blockUnverified } → the store's agent rules.
 * They apply from the next checkout, for Undo's own agent and for every MCP agent. Each change is kept in the store's
 * own event chain. Sandbox demo store; merchant sign-in comes with production use.
 */
export async function GET() {
  return NextResponse.json(await loadRules());
}

export async function PUT(req: Request) {
  const parsed = MerchantRules.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_rules", issues: parsed.error.issues }, { status: 400 });
  const limited = limitRoute(req, "merchant");
  if (limited) return limited;
  const before = await loadRules();
  await saveRules(parsed.data);
  await appendEvent("merchant:undo-demo-store", "MERCHANT_RULES_CHANGED", { before, after: parsed.data });
  return NextResponse.json(parsed.data);
}
