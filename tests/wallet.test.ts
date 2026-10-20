import assert from "node:assert/strict";
import { test } from "node:test";
import { AUTOPAY_MINUTES, undoWindow } from "../src/lib/agent-core";
import { generateSigningKey, signMessage } from "../src/lib/crypto";
import { prepareMandate, signingMessage, verifyMandate } from "../src/lib/mandate";
import { checkWalletRequest, safeReturnTo, walletMessage } from "../src/lib/wallet";

const intent = { item: "hoodie", category: "hoodie", quantity: 1, maxPrice: 80, currency: "USD", attributes: { size: "M" }, mustAsk: [] };

test("a wallet request must be signed by the device it is for, recently", () => {
  const key = generateSigningKey();
  const other = generateSigningKey();
  const now = new Date("2026-10-20T10:00:00.000Z");
  const requestedAt = "2026-10-20T09:58:00.000Z";
  const signature = signMessage(key.privateKey, walletMessage("save", key.publicKey, requestedAt));

  assert.deepEqual(checkWalletRequest({ action: "save", shopperKey: key.publicKey, requestedAt, signature }, now), { ok: true });
  // Someone else's key can't claim this signature, and a "save" signature isn't a "forget" one.
  assert.deepEqual(checkWalletRequest({ action: "save", shopperKey: other.publicKey, requestedAt, signature }, now), { ok: false, error: "bad_signature" });
  assert.deepEqual(checkWalletRequest({ action: "forget", shopperKey: key.publicKey, requestedAt, signature }, now), { ok: false, error: "bad_signature" });
  // An old signature can't be replayed.
  assert.deepEqual(
    checkWalletRequest({ action: "save", shopperKey: key.publicKey, requestedAt, signature }, new Date("2026-10-20T10:30:00.000Z")),
    { ok: false, error: "stale_request" },
  );
});

test("PayPal can only send the shopper back to the shop or a signing page", () => {
  assert.equal(safeReturnTo("/shop"), "/shop");
  assert.equal(safeReturnTo("/mandates/sign/0ea67cb5-229a-49fc-b5d6-92a62bfba1dd"), "/mandates/sign/0ea67cb5-229a-49fc-b5d6-92a62bfba1dd");
  for (const bad of ["//evil.test", "https://evil.test", "/shop?next=//evil.test", "/merchant", "", null, undefined]) assert.equal(safeReturnTo(bad), "/shop");
});

test("paying with the saved wallet is part of what the shopper signs", () => {
  const key = generateSigningKey();
  const m = prepareMandate("black hoodie size M under $80", intent, key.publicKey, new Date(), undefined, "saved_wallet");
  assert.equal(m.payWith, "saved_wallet");
  const signature = signMessage(key.privateKey, signingMessage(m));
  assert.equal(verifyMandate(m, signature).ok, true);

  // Stripping it, or adding it to a mandate signed without it, breaks the signature.
  const { payWith: _drop, ...without } = m;
  assert.equal(verifyMandate(without, signature).ok, false);
  const plain = prepareMandate("black hoodie size M under $80", intent, key.publicKey);
  assert.equal(plain.payWith, undefined);
  const plainSig = signMessage(key.privateKey, signingMessage(plain));
  assert.equal(verifyMandate({ ...plain, payWith: "saved_wallet" }, plainSig).ok, false);
});

test("an autopay purchase never captures instantly, even when it's cheap and certain", () => {
  const base = { price: 12, quantity: 1, confidence: 0.95, approximate: 0, unverifiable: 0, relaxed: 0, guardBypassed: false };
  assert.equal(undoWindow(base).minutes, 0);
  const auto = undoWindow({ ...base, autopay: true });
  assert.equal(auto.minutes, AUTOPAY_MINUTES);
  assert.ok(auto.factors.some((f) => /saved wallet/.test(f.factor)));
});
