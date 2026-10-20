import { NextResponse } from "next/server";
import { publicBaseUrl, UUID } from "@/lib/store";
import { completeSave } from "@/lib/wallet";

/**
 * GET /api/wallets/return?w=<wallet id> — PayPal sends the shopper here after the save-wallet page. If they approved,
 * the wallet is vaulted; either way they go back to where they started, with ?wallet=saved | not_approved.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("w") ?? "";
  const base = publicBaseUrl(req);
  if (!UUID.test(id)) return NextResponse.redirect(`${base}/shop?wallet=unknown`, 303);
  try {
    const { returnTo, outcome } = await completeSave(id);
    return NextResponse.redirect(`${base}${returnTo}?wallet=${outcome}`, 303);
  } catch (err) {
    console.error("wallet return failed:", err instanceof Error ? err.message : err);
    return NextResponse.redirect(`${base}/shop?wallet=error`, 303);
  }
}
