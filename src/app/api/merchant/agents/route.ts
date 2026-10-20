import { NextResponse } from "next/server";
import { agentRecords, loadRules, ruleEffect, scoreAgent } from "@/lib/trust";

/**
 * GET /api/merchant/agents → every agent that has shopped here, its record and trust score (with every point explained),
 * what the store's rules do to it right now, and the rules themselves. Sandbox demo store; no merchant sign-in.
 */
export async function GET() {
  const [records, rules] = await Promise.all([agentRecords(), loadRules()]);
  const agents = [...records.values()]
    .map((r) => {
      const trust = scoreAgent(r);
      return { ...r, trust, effect: ruleEffect({ name: r.name, verified: r.verified, via: r.via }, trust, rules) };
    })
    .sort((a, b) => a.trust.score - b.trust.score || b.purchases - a.purchases);
  return NextResponse.json({ rules, agents }, { headers: { "Cache-Control": "no-store" } });
}
