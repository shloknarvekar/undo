import { NextResponse } from "next/server";
import { runRogueAgents } from "@/lib/rogue";
import { QuotaExceeded, limitRoute, quotaResponse } from "@/lib/usage";

/**
 * POST /api/rogue → eight agents try to act on one freshly signed demo mandate; Undo's real guard decides each.
 * No orders, no PayPal calls. Runs are shared and reused for five minutes to spare the live catalog (lib/rogue.ts).
 */
export async function POST(req: Request) {
  const limited = limitRoute(req, "rogue");
  if (limited) return limited;
  try {
    return NextResponse.json(await runRogueAgents());
  } catch (err) {
    if (err instanceof QuotaExceeded) return quotaResponse(err);
    console.error("rogue run failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "rogue_run_failed", detail: err instanceof Error ? err.message : undefined }, { status: 503 });
  }
}
