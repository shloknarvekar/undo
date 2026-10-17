/**
 * Day-1 spike #5: PayPal → deployed Undo webhooks with signature verification.
 *
 *   1. Register (or reuse) the webhook for <base>/api/webhooks/paypal with Undo's event types.
 *   2. Trigger a real, signed event that needs no buyer: create a catalog product (CATALOG.PRODUCT.CREATED).
 *   3. Poll the deployed app's GET /api/webhooks/paypal until that event shows up as verified.
 *
 * Run: npm run spike:webhooks -- --base=https://undo-1c56.onrender.com
 */
import "dotenv/config";
import { catalog, PayPalError, WEBHOOK_EVENTS, webhooks } from "../src/lib/paypal";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=") as [string, string]));
const BASE = (args.base ?? process.env.UNDO_URL ?? "").replace(/\/$/, "");
const step = (label: string, detail = "") => console.log(`  ✔ ${label}${detail ? `  ${detail}` : ""}`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Recent = { recent: { id: string; type: string; resource: string | null; verified: boolean }[] };

async function main() {
  if (!BASE.startsWith("https://")) throw new Error("Pass --base=https://your-app (PayPal only delivers to https)");
  const url = `${BASE}/api/webhooks/paypal`;
  console.log(`\nUndo · webhooks spike → ${url}\n`);

  const existing = (await webhooks.list()).webhooks.find((w) => w.url === url);
  const hook = existing ?? (await webhooks.create(url, WEBHOOK_EVENTS));
  step(existing ? "Webhook already registered" : "Webhook registered", `${hook.id} · ${hook.event_types.length} event types`);

  const product = await catalog.createProduct(
    { name: `Undo webhook probe ${new Date().toISOString()}` },
    `undo-webhook-probe-${Date.now()}`,
  );
  step("Triggered CATALOG.PRODUCT.CREATED", product.id);

  for (let i = 0; i < 24; i++) {
    await sleep(5000);
    const res = await fetch(url, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) continue;
    const { recent } = (await res.json()) as Recent;
    const hit = recent.find((d) => d.resource === product.id);
    if (hit) {
      if (hit.verified) step("Delivered + signature verified", `${hit.type} ${hit.id}`);
      else console.log(`  ✖ Delivered but NOT verified: ${hit.type} ${hit.id}`);
      console.log(`\n  Recent deliveries: ${recent.map((d) => `${d.type}${d.verified ? "✓" : "✗"}`).join(", ")}\n`);
      return;
    }
  }
  console.log("  ✖ No delivery for the probe within 2 min (PayPal sandbox can lag; re-run to check again).\n");
}

main().catch((err) => {
  console.error(`\n✖ ${err instanceof PayPalError ? `${err.message}\n  ${JSON.stringify(err.body, null, 2)}` : err instanceof Error ? err.message : err}`);
  process.exit(1);
});
