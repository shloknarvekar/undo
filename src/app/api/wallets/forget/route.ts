import { NextResponse } from "next/server";
import { z } from "zod";
import { limitRoute } from "@/lib/usage";
import { checkWalletRequest, forget } from "@/lib/wallet";

/** POST /api/wallets/forget { shopperKey, requestedAt, signature } → deletes this device's saved wallet at PayPal. */
const Body = z.object({ shopperKey: z.string().min(40).max(60), requestedAt: z.string().datetime(), signature: z.string().min(80).max(100) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const limited = limitRoute(req, "wallet");
  if (limited) return limited;
  const check = checkWalletRequest({ action: "forget", ...parsed.data });
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 401 });
  return NextResponse.json({ forgotten: await forget(parsed.data.shopperKey) });
}
