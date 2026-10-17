/**
 * Shopping agent e2e against a running Undo server:
 *   shopper request → signed mandate → agent shops Channel3 under the mandate → PayPal AUTHORIZE checkout
 *   → (you approve in PayPal as the sandbox buyer) → payment authorized, undo window open.
 *
 * Run: npm run spike:agent -- --base=https://undo-1c56.onrender.com [--simulate=unguarded_wrong_variant] [--no-wait]
 *      [--request="Buy me a black hoodie, size M, under $80"]
 */
import { generateSigningKey, signMessage } from "../src/lib/crypto";

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "true"]; }));
const BASE = (args.base ?? "http://localhost:3000").replace(/\/$/, "");
const REQUEST = args.request ?? "Buy me black men's running shoes, size 10, under $120";
const step = (label: string, detail = "") => console.log(`  ✔ ${label}${detail ? `  ${detail}` : ""}`);
const fail = (label: string, detail: unknown): never => {
  console.log(`  ✖ ${label}: ${typeof detail === "string" ? detail : JSON.stringify(detail, null, 2)}`);
  process.exit(1);
};

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

async function main() {
  console.log(`\nUndo · shopping agent e2e → ${BASE}\n  request: "${REQUEST}"${args.simulate ? `\n  simulate: ${args.simulate}` : ""}\n`);

  const d = await api("POST", "/api/mandates/draft", { request: REQUEST });
  if (d.status !== 200 || !d.json.ready?.ok) fail("draft", d.json);
  const device = generateSigningKey();
  const p = await api("POST", "/api/mandates/prepare", { request: REQUEST, draft: d.json.draft, shopperKey: device.publicKey });
  if (p.status !== 200) fail("prepare", p.json);
  const c = await api("POST", "/api/mandates", { mandate: p.json.mandate, signature: signMessage(device.privateKey, p.json.signingMessage) });
  if (c.status !== 201) fail("store mandate", c.json);
  step("Mandate signed + stored", `${c.json.id} · ${JSON.stringify(d.json.draft.attributes)} ≤ $${d.json.draft.maxPrice}`);

  const t0 = Date.now();
  const s = await api("POST", `/api/mandates/${c.json.id}/shop`, args.simulate ? { simulate: args.simulate } : {});
  if (s.status !== 201) fail(`shop (${s.status})`, s.json);
  const { cart, agent, undoWindow, approveUrl, orderId } = s.json;
  step(`Agent shopped in ${((Date.now() - t0) / 1000).toFixed(1)}s`, `${cart.title} · ${cart.brand ?? "?"} · ${JSON.stringify(cart.variant)} · $${cart.price} · ${cart.retailer}`);
  console.log(`      reasoning: ${agent.reasoning}`);
  console.log(`      confidence ${agent.confidence} · unverified ${JSON.stringify(agent.unverified)} · guard ${agent.guard.bypassed ? "BYPASSED" : "passed"}${agent.guard.violations.length ? ` · violations ${JSON.stringify(agent.guard.violations)}` : ""}`);
  console.log(`      considered: ${agent.considered.map((x: { title: string; price: number; ok: boolean; why?: string }) => `${x.ok ? "✓" : "✗"} ${x.title.slice(0, 32)} $${x.price}${x.why ? ` (${x.why})` : ""}`).join(" | ")}`);
  step("Undo window decided", `${undoWindow.minutes} min ← ${undoWindow.factors.map((f: { factor: string; minutes: number }) => `${f.factor} +${f.minutes}`).join(", ")}`);
  step("PayPal AUTHORIZE checkout created", orderId);

  if (args["no-wait"]) return console.log(`\n  Approve later: ${approveUrl}\n  Order: ${BASE}/api/orders/${orderId}\n`);

  console.log(`\n  → Approve as your US SANDBOX PERSONAL buyer (you'll land on the order JSON afterwards):\n     ${approveUrl}\n`);
  const deadline = Date.now() + 10 * 60_000;
  while (Date.now() < deadline) {
    const o = await api("GET", `/api/orders/${orderId}`).catch(() => null);
    const status = o?.json.order?.status;
    if (status && status !== "CHECKOUT_CREATED") {
      if (!["AUTHORIZED", "CAPTURED"].includes(status)) fail(`order ended ${status}`, o!.json.chain);
      const { order, undoWindow: w, chain } = o!.json;
      step(`Payment ${status}`, `authorization ${order.paypal.authorizationId}${order.paypal.captureId ? ` · capture ${order.paypal.captureId}` : ""}`);
      step("Undo window", w.open ? `OPEN until ${w.endsAt} (${w.minutesLeft} min left) — Undo now = free void` : "closed (captured)");
      step(`Event chain ${chain.intact ? "intact" : "BROKEN"}`, chain.events.map((e: { type: string }) => e.type).join(" → "));
      return console.log("\nShopping agent works end to end. ✅\n");
    }
    await new Promise((r) => setTimeout(r, 4000));
  }
  fail("approval", "not approved within 10 minutes");
}

main().catch((err) => fail("unexpected", err instanceof Error ? err.message : String(err)));
