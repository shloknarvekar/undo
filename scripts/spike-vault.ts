/**
 * Vault spike (go / no-go): can the sandbox save a shopper's PayPal wallet once, then charge it later with no shopper
 * present? That is what "the agent pays by itself, Undo is the safety net" needs.
 *
 *   npm run spike:vault -- check    → the store app's token carries the Vault scope (prints no secrets)
 *   npm run spike:vault             → 1. setup token for a PayPal wallet (merchant-initiated use) → approval link
 *                                     2. waits for the shopper to approve it in the sandbox
 *                                     3. turns it into a payment token (the vault id)
 *                                     4. creates a $1.00 AUTHORIZE order with only that vault id: no redirect, no clicks
 *                                     5. voids the authorization straight away, so no money moves
 *   npm run spike:vault -- --resume → picks up a setup token that was already approved
 *
 * Prints ids and statuses only, never the buyer's email or name.
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const BASE = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const APP = (process.env.APP_URL ?? "https://undo-1c56.onrender.com").replace(/\/$/, "");
const STATE = "data/vault-spike.json";
const args = new Set(process.argv.slice(2));

async function token(): Promise<{ token: string; scopes: string[] }> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not in .env");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`OAuth failed: ${body.error_description ?? res.status}`);
  return { token: body.access_token, scopes: String(body.scope ?? "").split(" ") };
}

async function api(auth: string, method: "GET" | "POST", path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${auth}`,
      "Content-Type": "application/json",
      ...(method === "POST" ? { "PayPal-Request-Id": randomUUID() } : {}),
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json, debugId: res.headers.get("paypal-debug-id") };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose JSON from PayPal in a dev script
function failure(step: string, r: { status: number; json: any; debugId: string | null }): never {
  const d = r.json?.details?.[0];
  throw new Error(`${step} → HTTP ${r.status} ${r.json?.name ?? ""}: ${d?.issue ?? ""} ${d?.description ?? r.json?.message ?? ""} (debug id ${r.debugId})`);
}

async function check() {
  const { scopes } = await token();
  // Vault v3 (wallets) needs the payment-tokens scope; the older v1 credit-card vault scopes don't count.
  const vault = scopes.filter((s) => /vault\/payment-tokens/i.test(s));
  console.log(vault.length ? `✔ Vault v3 scope on the store app: ${vault.join(", ")}` : '✖ No Vault v3 scope (payment-tokens): in the developer dashboard, open the app → Features → tick "Save payment methods" → Save.');
  return vault.length > 0;
}

async function main() {
  console.log(`\nVault spike → ${BASE}\n`);
  const hasScope = await check();
  if (args.has("check")) return;
  if (!hasScope) console.log("  (trying anyway: the setup-token call is the real test)\n");
  const { token: auth } = await token();

  // 1. Setup token (or resume one).
  let setupId: string;
  if (args.has("--resume")) {
    setupId = JSON.parse(await readFile(STATE, "utf8")).setupId;
    console.log(`  ↻ resuming setup token ${setupId}`);
  } else {
    const s = await api(auth, "POST", "/v3/vault/setup-tokens", {
      payment_source: {
        paypal: {
          description: "Undo: lets your shopping agent pay inside the mandate you sign",
          usage_pattern: "IMMEDIATE",
          usage_type: "MERCHANT",
          customer_type: "CONSUMER",
          permit_multiple_payment_tokens: false,
          experience_context: {
            brand_name: "Undo",
            shipping_preference: "NO_SHIPPING",
            return_url: `${APP}/?vault=approved`,
            cancel_url: `${APP}/?vault=cancelled`,
          },
        },
      },
    });
    if (s.status >= 300) failure("create setup token", s);
    setupId = s.json.id;
    await mkdir("data", { recursive: true });
    await writeFile(STATE, JSON.stringify({ setupId }, null, 2));
    const approve = s.json.links?.find((l: { rel: string }) => l.rel === "approve")?.href;
    console.log(`  ✔ setup token ${setupId} (${s.json.status})`);
    console.log(`\n  → Approve saving the wallet as your US SANDBOX PERSONAL buyer:\n     ${approve}\n  (Waiting up to 30 min.)\n`);
  }

  // 2. Wait for approval.
  const deadline = Date.now() + 30 * 60_000;
  for (;;) {
    const g = await api(auth, "GET", `/v3/vault/setup-tokens/${setupId}`);
    if (g.status >= 300) failure("read setup token", g);
    if (g.json.status === "APPROVED") break;
    if (Date.now() > deadline) throw new Error(`setup token still ${g.json.status} after 30 min; re-run with --resume once approved`);
    await new Promise((r) => setTimeout(r, 4000));
  }
  console.log("  ✔ shopper approved saving the wallet");

  // 3. Payment token = the vault id the agent would use.
  const p = await api(auth, "POST", "/v3/vault/payment-tokens", { payment_source: { token: { id: setupId, type: "SETUP_TOKEN" } } });
  if (p.status >= 300) failure("create payment token", p);
  const vaultId: string = p.json.id;
  console.log(`  ✔ wallet vaulted: payment token ${vaultId} · customer ${p.json.customer?.id ?? "?"}`);

  // 4. Merchant-initiated charge: no redirect, no buyer.
  const o = await api(auth, "POST", "/v2/checkout/orders", {
    intent: "AUTHORIZE",
    purchase_units: [{ reference_id: "vault-spike", description: "Undo vault spike (voided at once)", amount: { currency_code: "USD", value: "1.00" } }],
    payment_source: { paypal: { vault_id: vaultId } },
  });
  if (o.status >= 300) failure("create order with vault id", o);
  console.log(`  ✔ order ${o.json.id} created with the vault id alone → status ${o.json.status}`);
  let auths = o.json.purchase_units?.[0]?.payments?.authorizations ?? [];
  if (!auths.length && o.json.status !== "COMPLETED") {
    const a = await api(auth, "POST", `/v2/checkout/orders/${o.json.id}/authorize`, {});
    if (a.status >= 300) failure("authorize order", a);
    auths = a.json.purchase_units?.[0]?.payments?.authorizations ?? [];
  }
  const authorization = auths[0];
  if (!authorization) throw new Error(`no authorization came back (order status ${o.json.status})`);
  console.log(`  ✔ authorization ${authorization.id} · ${authorization.status} · $${authorization.amount?.value}`);

  // 5. Void it: the spike moves no money.
  const v = await api(auth, "POST", `/v2/payments/authorizations/${authorization.id}/void`, {});
  if (v.status >= 300) failure("void authorization", v);
  console.log(`  ✔ authorization voided (HTTP ${v.status}); no money moved`);

  console.log(
    `\nGO ✅  The sandbox vaults a PayPal wallet with one approval and authorizes later charges with no shopper present.\n` +
      `    Payment token ${vaultId} stays saved for the build.\n`,
  );
  await writeFile(STATE, JSON.stringify({ setupId, vaultId, customerId: p.json.customer?.id ?? null, verifiedAt: new Date().toISOString() }, null, 2));
}

main().catch((err) => {
  console.log(`\n  ✖ ${err instanceof Error ? err.message : err}\n`);
  process.exit(1);
});
