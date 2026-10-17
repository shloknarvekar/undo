/**
 * End-to-end mandate flow against a running Undo server (local or deployed):
 *   draft (Gemini) → prepare → shopper signs on "device" (local Ed25519 key) → store → read back + integrity,
 *   then the attacks: a tampered budget and a replay must both be rejected.
 *
 * Run: npm run spike:mandate                       (http://localhost:3000)
 *      npm run spike:mandate -- --base=https://undo-1c56.onrender.com
 */
import { generateSigningKey, signMessage } from "../src/lib/crypto";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=") as [string, string]));
const BASE = (args.base ?? "http://localhost:3000").replace(/\/$/, "");
const REQUEST = args.request ?? "Buy me black men's running shoes, size 10, under $120";
const step = (label: string, detail = "") => console.log(`  ✔ ${label}${detail ? `  ${detail}` : ""}`);
const fail = (label: string, detail: unknown) => {
  console.log(`  ✖ ${label}: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`);
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
  console.log(`\nUndo · mandate e2e → ${BASE}\n  request: "${REQUEST}"\n`);

  const d = await api("POST", "/api/mandates/draft", { request: REQUEST });
  if (d.status !== 200) fail("draft", d.json);
  step("Draft parsed", JSON.stringify(d.json.draft));
  if (!d.json.ready.ok) fail("draft not ready to sign", { reason: d.json.ready.reason, mustAsk: d.json.draft.mustAsk });

  const device = generateSigningKey(); // stands in for the shopper's phone/passkey
  const p = await api("POST", "/api/mandates/prepare", { request: REQUEST, draft: d.json.draft, shopperKey: device.publicKey });
  if (p.status !== 200) fail("prepare", p.json);
  const signature = signMessage(device.privateKey, p.json.signingMessage);
  step("Prepared + signed on device", p.json.signingMessage.slice(0, 48) + "…");

  const c = await api("POST", "/api/mandates", { mandate: p.json.mandate, signature });
  if (c.status !== 201) fail("store", c.json);
  step("Stored", `${c.json.id} · event #${c.json.event.seq} ${c.json.event.hash.slice(0, 12)}…`);

  const g = await api("GET", `/api/mandates/${c.json.id}`);
  if (g.status !== 200) fail("read", g.json);
  const { integrity, search, events } = g.json;
  if (!integrity.digestMatches || !integrity.signatureValid || !integrity.chainIntact) fail("integrity", integrity);
  step("Read back, integrity OK", `${events.length} event(s), search=${JSON.stringify(search)}`);

  const tampered = { ...p.json.mandate, id: crypto.randomUUID(), intent: { ...p.json.mandate.intent, maxPrice: 999 } };
  const t = await api("POST", "/api/mandates", { mandate: tampered, signature });
  if (t.status !== 422 || t.json.error !== "bad_signature") fail("tampered budget was accepted", t);
  step("Tampered budget ($999) rejected", `${t.status} ${t.json.error}`);

  const r = await api("POST", "/api/mandates", { mandate: p.json.mandate, signature });
  if (r.status !== 409) fail("replay was accepted", r);
  step("Replay rejected", `${r.status} ${r.json.error}`);

  console.log("\nMandate service works end to end. ✅\n");
}

main().catch((err) => fail("unexpected", err instanceof Error ? err.message : String(err)));
