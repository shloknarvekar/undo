import { NextResponse } from "next/server";
import { runRogueAgents } from "@/lib/rogue";

/**
 * POST /api/rogue → eight agents try to act on one freshly signed demo mandate; Undo's real guard decides each.
 * No orders, no PayPal calls. A run is reused for two minutes to spare the live catalog.
 */
export async function POST() {
  try {
    return NextResponse.json(await runRogueAgents());
  } catch (err) {
    console.error("rogue run failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "rogue_run_failed", detail: err instanceof Error ? err.message : undefined }, { status: 503 });
  }
}
