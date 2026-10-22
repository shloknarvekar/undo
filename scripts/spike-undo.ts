/**
 * Undo e2e — the four demo scenarios against a running server, end to end with real sandbox money:
 *   A  agent fault, window open      → VOID (no money moved)
 *   B  agent fault, after capture    → full REFUND, liability on the agent operator
 *   C  merchant shipped wrong item   → photo → CLAIM_OPEN → merchant accepts → REFUND
 *   D  shopper changed mind          → merchant protected → RETURN_PENDING → return received → partial refund
 *
 * All four checkouts are created first; you approve the four PayPal links, then everything else is automatic.
 * Run: npm run spike:undo -- --base=https://undo-1c56.onrender.com [--only=A,C] [--resume]
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { generateSigningKey, signMessage } from "../src/lib/crypto";
import { undoSigningMessage } from "../src/lib/fault-core";

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "true"]; }));
const BASE = (args.base ?? "http://localhost:3000").replace(/\/$/, "");
const ONLY = args.only ? new Set(args.only.split(",")) : null;
const log = (s: string) => console.log(s);

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose JSON from the live API in a dev script
function must(r: { status: number; json: any }, ok: number, what: string) {
  if (r.status !== ok) throw new Error(`${what} → ${r.status} ${JSON.stringify(r.json).slice(0, 400)}`);
  return r.json;
}

type Scenario = { id: "A" | "B" | "C" | "D"; title: string; request: string; simulate?: string; expireFirst: boolean; reason: string; photo?: boolean; expect: string; merchant?: "accept_claim" | "return_received" };
const SCENARIOS: Scenario[] = [
  { id: "A", title: "Agent fault inside the window", request: "Buy me black men's running shoes, size 10, under $120", simulate: "unguarded_wrong_variant", expireFirst: false, reason: "This isn't what I asked for.", expect: "VOID" },
  { id: "B", title: "Agent fault after capture", request: "Buy me black men's running shoes, size 10, under $120", simulate: "unguarded_wrong_variant", expireFirst: true, reason: "This isn't what I asked for.", expect: "REFUND_FULL" },
  { id: "C", title: "Merchant shipped the wrong item", request: "Buy me a black hoodie, size M, under $80", expireFirst: true, reason: "The hoodie that arrived is not the one I ordered.", photo: true, expect: "OPEN_CLAIM", merchant: "accept_claim" },
  { id: "D", title: "Shopper changed their mind", request: "Buy me a black hoodie, size M, under $80", expireFirst: true, reason: "I changed my mind, I don't need it anymore.", expect: "AUTHORIZE_RETURN", merchant: "return_received" },
];

async function deliveredPhoto(): Promise<{ dataUrl: string; sha256: string; what: string }> {
  // A clearly different item stands in for "what arrived": a bright yellow hoodie instead of a black one.
  const s = must(await api("POST", "/api/products/search", { query: "yellow hoodie", category: "hoodie", color: "yellow", limit: 8 }), 200, "photo search");
  for (const p of s.products) {
    if (!p.imageUrl) continue;
    const res = await fetch(p.imageUrl);
    const type = (res.headers.get("content-type") ?? "").split(";")[0];
    if (!res.ok || !/^image\/(jpeg|png|webp)$/.test(type)) continue;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > 3_500_000) continue;
    return { dataUrl: `data:${type};base64,${bytes.toString("base64")}`, sha256: createHash("sha256").update(bytes).digest("hex"), what: p.title };
  }
  throw new Error("no usable delivered-item photo found");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose JSON from the live API in a dev script
type Run = { s: Scenario; key: ReturnType<typeof generateSigningKey>; orderId: string; approveUrl: string; cart: any };
// Test-buyer keys live only in this git-ignored file, so an unfinished run can be resumed with --resume.
const STATE = "data/undo-e2e.json";

async function main() {
  const scenarios = SCENARIOS.filter((s) => !ONLY || ONLY.has(s.id));
  log(`\nUndo · fault engine e2e → ${BASE}\n`);

  const runs: Run[] = args.resume ? JSON.parse(await readFile(STATE, "utf8")) : [];
  if (args.resume) log(`  ↻ resuming ${runs.length} checkouts from ${STATE}`);
  for (const s of args.resume ? [] : scenarios) {
    const key = generateSigningKey();
    const d = must(await api("POST", "/api/mandates/draft", { request: s.request }), 200, `${s.id} draft`);
    if (!d.ready.ok) throw new Error(`${s.id} draft not ready: ${JSON.stringify(d.draft.mustAsk)}`);
    const p = must(await api("POST", "/api/mandates/prepare", { request: s.request, draft: d.draft, shopperKey: key.publicKey }), 200, `${s.id} prepare`);
    const m = must(await api("POST", "/api/mandates", { mandate: p.mandate, signature: signMessage(key.privateKey, p.signingMessage) }), 201, `${s.id} mandate`);
    const shop = must(await api("POST", `/api/mandates/${m.id}/shop`, s.simulate ? { simulate: s.simulate } : {}), 201, `${s.id} shop`);
    runs.push({ s, key, orderId: shop.orderId, approveUrl: shop.approveUrl, cart: shop.cart });
    log(`  ✔ ${s.id} agent bought  ${shop.cart.title} · ${JSON.stringify(shop.cart.variant)} · $${shop.cart.price}${s.simulate ? "  (simulated careless agent)" : ""}`);
  }
  await mkdir("data", { recursive: true });
  await writeFile(STATE, JSON.stringify(runs, null, 2));

  log(`\n  → Approve these ${runs.length} PayPal payments as your US SANDBOX PERSONAL buyer (any order):`);
  for (const r of runs) log(`     ${r.s.id}  $${r.cart.price}  ${r.approveUrl}`);
  log(`  (Waiting up to 60 min. If this stops, re-run with --resume to pick up the same checkouts.)\n`);

  const pending = new Set(runs.map((r) => r.orderId));
  const deadline = Date.now() + 60 * 60_000;
  while (pending.size && Date.now() < deadline) {
    for (const id of [...pending]) {
      const o = await api("GET", `/api/orders/${id}`).catch(() => null);
      const st = o?.json.order?.status;
      if (st && st !== "CHECKOUT_CREATED") {
        pending.delete(id);
        const r = runs.find((x) => x.orderId === id)!;
        log(`  ✔ ${r.s.id} payment ${st}  (${runs.length - pending.size}/${runs.length})`);
      }
    }
    if (pending.size) await new Promise((r) => setTimeout(r, 4000));
  }
  if (pending.size) throw new Error(`not approved in time: ${[...pending].join(", ")}`);

  const photo = scenarios.some((s) => s.photo) ? await deliveredPhoto() : null;
  const summary: string[] = [];

  for (const r of runs) {
    log(`\n  ── ${r.s.id}: ${r.s.title}`);
    if (r.s.expireFirst) {
      const e = must(await api("POST", `/api/orders/${r.orderId}/expire-window`), 200, `${r.s.id} expire`);
      log(`     window closed → captured ${e.captureId}`);
    }
    const requestedAt = new Date().toISOString();
    const usePhoto = r.s.photo ? photo : null;
    const signature = signMessage(r.key.privateKey, undoSigningMessage(r.orderId, r.s.reason, usePhoto?.sha256 ?? null, requestedAt));
    if (usePhoto) log(`     delivered photo: "${usePhoto.what}"`);
    const u = await api("POST", `/api/orders/${r.orderId}/undo`, { reason: r.s.reason, requestedAt, signature, ...(usePhoto ? { photo: usePhoto.dataUrl } : {}) });
    if (u.status !== 200) throw new Error(`${r.s.id} undo → ${u.status} ${JSON.stringify(u.json).slice(0, 400)}`);
    const { decision, outcome } = u.json;
    log(`     verdict ${decision.verdict} (${decision.confidence}) · liability ${decision.liability}`);
    for (const e of decision.evidence) log(`       · [${e.source}] ${e.finding}`);
    log(`     money: ${outcome.action.type} → ${outcome.status} ${JSON.stringify(outcome.paypal)}${outcome.evidenceDigest ? ` · evidence ${outcome.evidenceDigest.slice(0, 12)}…` : ""}`);
    let final = outcome.status;
    if (r.s.merchant && outcome.action.type === r.s.expect) {
      const res = must(await api("POST", `/api/orders/${r.orderId}/resolve`, { action: r.s.merchant }), 200, `${r.s.id} resolve`);
      log(`     merchant ${r.s.merchant} → ${res.status} refund ${res.refundId}`);
      final = res.status;
    }
    const chainRes = must(await api("GET", `/api/orders/${r.orderId}`), 200, `${r.s.id} read`);
    const pass = outcome.action.type === r.s.expect && chainRes.chain.intact;
    summary.push(`  ${pass ? "✔" : "✖"} ${r.s.id} ${r.s.title}: expected ${r.s.expect}, got ${outcome.action.type} → ${final} · chain ${chainRes.chain.intact ? "intact" : "BROKEN"} (${chainRes.chain.events.length} events)`);
  }

  log(`\n${summary.join("\n")}\n`);
  if (summary.some((l) => l.startsWith("  ✖"))) process.exit(1);
  log("Undo works end to end. ✅\n");
}

main().catch((err) => {
  console.log(`\n  ✖ ${err instanceof Error ? err.message : err}\n`);
  process.exit(1);
});
