# Verify an order yourself (/docs/guides/verify-evidence)



[`GET /api/orders/{orderId}/evidence`](/api/undo/orders/getOrderEvidence) returns the order's raw event chain exactly as hashed, and the signed mandate exactly as stored. Nothing is pre-verified, on purpose. This script checks all of it with Node's built-in crypto and no dependencies.

```js title="verify.mjs"
import { createHash, createPublicKey, verify } from "node:crypto";

const canonical = (v) => JSON.stringify(sort(v));
const sort = (v) =>
  Array.isArray(v) ? v.map(sort)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => [k, sort(v[k])]))
  : v;
const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const ed25519Key = (b64) =>
  createPublicKey({ key: Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(b64, "base64")]), format: "der", type: "spki" });

const orderId = process.argv[2] ?? "edd288bc-42d0-41d3-9b87-14915f3ff2c6";
const { mandate, events } = await (await fetch(`https://undo-1c56.onrender.com/api/orders/${orderId}/evidence`)).json();

// 1. Every event's hash links to the one before it.
let prev = "0".repeat(64);
for (const e of events) {
  const { subjectId, seq, type, payload, createdAt } = e;
  const ok = e.prevHash === prev && e.hash === sha256(prev + canonical({ subjectId, seq, type, payload, createdAt }));
  console.log(ok ? "ok  " : "BAD ", e.seq, e.type);
  prev = e.hash;
}

// 2. The shopper's device signed this exact mandate.
const digest = sha256(canonical(mandate));
const message = `undo-intent-mandate-v${mandate.version}:${digest}`;
const signed = events.find((e) => e.type === "MANDATE_SIGNED").payload;
console.log("mandate digest matches:", digest === signed.digest);
console.log("shopper signature valid:", verify(null, Buffer.from(message, "utf8"), ed25519Key(mandate.shopperKey), Buffer.from(signed.signature, "base64")));

// 3. The Undo request was signed by the same key.
const undo = events.find((e) => e.type === "UNDO_REQUESTED")?.payload;
if (undo) {
  const msg = `undo-request-v1:${orderId}:${sha256(undo.reason)}:${undo.photoSha256 ?? "-"}:${undo.requestedAt}`;
  console.log("undo signature valid:", verify(null, Buffer.from(msg, "utf8"), ed25519Key(mandate.shopperKey), Buffer.from(undo.signature, "base64")));
}
```

Run it on the finished refund case:

```bash
node verify.mjs edd288bc-42d0-41d3-9b87-14915f3ff2c6
```

```text
ok   0 MANDATE_SIGNED
ok   1 CART_PROPOSED
ok   2 CHECKOUT_CREATED
ok   3 PAYMENT_AUTHORIZED
ok   4 WINDOW_FAST_FORWARDED
ok   5 PAYMENT_CAPTURED
ok   6 UNDO_REQUESTED
ok   7 VERDICT
ok   8 PAYMENT_REFUNDED
ok   9 LIABILITY_ASSIGNED
ok   10 LIABILITY_PAYOUT_SENT
ok   11 LIABILITY_SETTLED
mandate digest matches: true
shopper signature valid: true
undo signature valid: true
```

## How the chain works [#how-the-chain-works]

* Events are numbered from 0. The first event's `prevHash` is 64 zeros.
* `hash = sha256(prevHash + canonical({ subjectId, seq, type, payload, createdAt }))`.
* Editing any event changes its hash, so the next event's `prevHash` stops matching and every check after it fails.

The same checks run in the browser on every order page under **Verify in my browser**, with buttons that tamper with a copy so you can watch them fail.
