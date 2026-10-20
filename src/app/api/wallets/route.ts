import { NextResponse } from "next/server";
import { z } from "zod";
import { publicBaseUrl } from "@/lib/store";
import { limitRoute } from "@/lib/usage";
import { activeWallet, checkWalletRequest, startSave } from "@/lib/wallet";

/**
 * GET  /api/wallets?key=<shopperKey>  → whether this device has a saved PayPal wallet (yes/no and since when, nothing else)
 * POST /api/wallets { shopperKey, requestedAt, signature, returnTo } → the PayPal page to approve saving the wallet.
 *      Signed by the device key, so a wallet can only ever be attached to the device that asked for it.
 */
const Key = z.string().min(40).max(60);
const Body = z.object({ shopperKey: Key, requestedAt: z.string().datetime(), signature: z.string().min(80).max(100), returnTo: z.string().max(80).optional() });

export async function GET(req: Request) {
  const key = Key.safeParse(new URL(req.url).searchParams.get("key"));
  if (!key.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const w = await activeWallet(key.data);
  return NextResponse.json({ saved: Boolean(w), since: w?.since ?? null }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  const limited = limitRoute(req, "wallet");
  if (limited) return limited;
  const check = checkWalletRequest({ action: "save", ...parsed.data });
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 401 });
  try {
    const { approveUrl } = await startSave({ shopperKey: parsed.data.shopperKey, returnTo: parsed.data.returnTo ?? "/shop", baseUrl: publicBaseUrl(req) });
    return NextResponse.json({ approveUrl }, { status: 201 });
  } catch (err) {
    console.error("wallet setup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "wallet_setup_failed" }, { status: 502 });
  }
}
