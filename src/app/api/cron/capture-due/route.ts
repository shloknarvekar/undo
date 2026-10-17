import { NextResponse } from "next/server";
import { captureDue } from "@/lib/money";

/**
 * POST /api/cron/capture-due — run the undo-window scheduler now. For an external free pinger; the app also
 * sweeps opportunistically on traffic (see maybeSweep). Requires `Authorization: Bearer $CRON_SECRET` when set.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const captured = await captureDue();
  return NextResponse.json({ captured });
}
