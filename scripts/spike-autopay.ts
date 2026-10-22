/**
 * Autopay e2e: the agent pays with the shopper's saved PayPal wallet, with no redirect, and Undo still undoes it.
 * Runs against a live server with a throwaway device key:
 *   1. the key signs "save my wallet" → you approve once in the PayPal sandbox
 *   2. a mandate signed with payWith: "saved_wallet" → Undo's agent shops and pays by itself (no approval link)
 *   3. the key signs an undo inside the window → the authorization is voided, no money moves
 *   4. the key signs "forget my wallet" → the payment token is deleted at PayPal
 *
 * Run: npm run spike:autopay -- --base=https://undo-1c56.onrender.com [--resume]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { generateSigningKey, signMessage } from "../src/lib/crypto";
import { undoSigningMessage } from "../src/lib/fault-core";
import { walletMessage } from "../src/lib/wallet";

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "true"]; }));
const BASE = (args.base ?? "http://localhost:3000").replace(/\/$/, "");
const STATE = "data/autopay-e2e.json";
const REQUEST = "A black hoodie, size M, under $80";

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose JSON from the live API in a dev script
function must(r: { status: number; json: any }, ok: number, what: string) {
  if (r.status !== ok) throw new Error(`${what} → ${r.status} ${JSON.stringify(r.json).slice(0, 400)}`);
  return r.json;
}
const walletRequest = (key: { publicKey: string; privateKey: string }, action: "save" | "forget") => {
  const requestedAt = new Date().toISOString();
  return { shopperKey: key.publicKey, requestedAt, signature: signMessage(key.privateKey, walletMessage(action, key.publicKey, requestedAt)) };
};

async function main() {
  console.log(`\nUndo · autopay e2e → ${BASE}\n`);
  const key: { publicKey: string; privateKey: string } = args.resume ? JSON.parse(await readFile(STATE, "utf8")).key : generateSigningKey();
  await mkdir("data", { recursive: true });
  await writeFile(STATE, JSON.stringify({ key }, null, 2));

  // 1. Save the wallet (once).
  const status = must(await api("GET", `/api/wallets?key=${encodeURIComponent(key.publicKey)}`), 200, "wallet status");
  if (!status.saved) {
    const s = must(await api("POST", "/api/wallets", { ...walletRequest(key, "save"), returnTo: "/shop" }), 201, "save wallet");
    console.log(`  → Approve saving the wallet as your US SANDBOX PERSONAL buyer:\n     ${s.approveUrl}\n  (Waiting up to 30 min. If this stops, re-run with --resume.)\n`);
    const deadline = Date.now() + 30 * 60_000;
    for (;;) {
      // A dropped connection during a long wait is retried, not fatal; the deadline still applies.
      const saved = await api("GET", `/api/wallets?key=${encodeURIComponent(key.publicKey)}`)
        .then((r) => must(r, 200, "wallet status").saved)
        .catch(() => false);
      if (saved) break;
      if (Date.now() > deadline) throw new Error("wallet not saved after 30 min");
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
  console.log("  ✔ wallet saved for this device key");

  // 2. A mandate that lets the agent pay with it, then the agent shops.
  const d = must(await api("POST", "/api/mandates/draft", { request: REQUEST }), 200, "draft");
  if (!d.ready.ok) throw new Error(`draft not ready: ${JSON.stringify(d.draft.mustAsk)}`);
  const p = must(await api("POST", "/api/mandates/prepare", { request: REQUEST, draft: d.draft, shopperKey: key.publicKey, payWith: "saved_wallet" }), 200, "prepare");
  if (p.mandate.payWith !== "saved_wallet") throw new Error("prepared mandate is missing payWith");
  const m = must(await api("POST", "/api/mandates", { mandate: p.mandate, signature: signMessage(key.privateKey, p.signingMessage) }), 201, "store mandate");
  console.log(`  ✔ mandate ${m.id} signed with payWith: saved_wallet`);
  const shop = must(await api("POST", `/api/mandates/${m.id}/shop`, {}), 201, "shop");
  if (shop.approveUrl !== null || shop.paidWith !== "saved_wallet") throw new Error(`agent didn't pay by itself: ${JSON.stringify({ approveUrl: shop.approveUrl, paidWith: shop.paidWith, walletNote: shop.walletNote })}`);
  console.log(`  ✔ agent bought ${shop.cart.title} · $${shop.cart.price} and PAID BY ITSELF → ${shop.status}, undo window ${shop.undoWindow.minutes} min (until ${shop.windowEndsAt})`);
  const factor = shop.undoWindow.factors.find((f: { factor: string }) => /saved wallet/.test(f.factor));
  console.log(`  ✔ window factor: "${factor?.factor}" +${factor?.minutes} min`);

  // 3. Undo it inside the window.
  const reason = "I didn't mean to buy this.";
  const requestedAt = new Date().toISOString();
  const u = must(
    await api("POST", `/api/orders/${shop.orderId}/undo`, { reason, requestedAt, signature: signMessage(key.privateKey, undoSigningMessage(shop.orderId, reason, null, requestedAt)) }),
    200,
    "undo",
  );
  console.log(`  ✔ undo → verdict ${u.decision.verdict} · ${u.outcome.action.type} → ${u.outcome.status}`);
  const order = must(await api("GET", `/api/orders/${shop.orderId}`), 200, "read order");
  const authorized = order.chain.events.find((e: { type: string }) => e.type === "PAYMENT_AUTHORIZED");
  console.log(`  ✔ chain intact: ${order.chain.intact} · authorization step says: "${authorized?.proof.how}"`);

  // 4. Forget the wallet.
  const f = must(await api("POST", "/api/wallets/forget", walletRequest(key, "forget")), 200, "forget wallet");
  const after = must(await api("GET", `/api/wallets?key=${encodeURIComponent(key.publicKey)}`), 200, "wallet status");
  console.log(`  ✔ forgot ${f.forgotten} wallet(s); saved now: ${after.saved}`);

  const ok = order.order.status === "VOIDED" && order.chain.intact && !after.saved;
  console.log(`\n${ok ? "Autopay works end to end. ✅" : "✖ something didn't end where expected"}  order ${shop.orderId} (${order.order.status})\n`);
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.log(`\n  ✖ ${err instanceof Error ? err.message : err}\n`);
  process.exit(1);
});
