import { NextResponse } from "next/server";
import { catalog } from "@/lib/paypal";

/**
 * GET /api/health — Render's health check (shallow, no external calls) and a deploy smoke test.
 * GET /api/health?deep=1 — also proves the deployed service can reach PayPal sandbox with its env credentials.
 * Never returns secret values, only whether each one is configured.
 * (Reading the request keeps this handler dynamic; no segment config needed with cacheComponents.)
 */

export async function GET(req: Request) {
  const configured = {
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    channel3: Boolean(process.env.CHANNEL3_API_KEY),
    database: Boolean(process.env.DATABASE_URL),
  };
  const body: Record<string, unknown> = {
    ok: true,
    service: "undo",
    commit: process.env.RENDER_GIT_COMMIT?.slice(0, 7) ?? "local",
    configured,
  };

  if (new URL(req.url).searchParams.has("deep") && configured.paypal) {
    try {
      // Cheap authenticated call: fails fast on bad credentials or no network egress.
      await catalog.get("PROD-UNDO-HEALTHCHECK").catch((err) => {
        if (err?.status === 404) return; // authenticated fine, product just doesn't exist
        throw err;
      });
      body.paypal = "reachable";
    } catch (err) {
      body.ok = false;
      body.paypal = err instanceof Error ? err.message : "error";
    }
  }

  return NextResponse.json(body, { status: body.ok ? 200 : 503 });
}
