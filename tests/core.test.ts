import assert from "node:assert/strict";
import { test } from "node:test";
import type { StoreProduct } from "../src/lib/channel3";
import { canonicalJson, chainNext, generateSigningKey, signMessage, verifyChain, verifySignature, type ChainedEvent } from "../src/lib/crypto";
import { checkCart, mandateDigest, mandateToSearch, prepareMandate, signingMessage, verifyMandate } from "../src/lib/mandate";

const intent = {
  item: "running shoes",
  category: "running shoes",
  quantity: 1,
  maxPrice: 120,
  currency: "USD",
  attributes: { size: "10", color: "black" },
  mustAsk: [],
};

const product = (over: Partial<StoreProduct> = {}): StoreProduct => ({
  channel3Id: "p1",
  title: "Runner",
  brand: "adidas",
  description: null,
  price: 99,
  currency: "USD",
  imageUrl: null,
  sourceUrl: "https://example.com",
  sourceDomain: "example.com",
  colors: [],
  attributes: {},
  variant: { Size: "10", Color: "Black" },
  variantOptions: [],
  ...over,
});

test("canonicalJson is key-order independent", () => {
  assert.equal(canonicalJson({ b: 1, a: { d: 2, c: 3 } }), canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
});

test("Ed25519 sign/verify round-trip and rejects tampering", () => {
  const k = generateSigningKey();
  const sig = signMessage(k.privateKey, "hello");
  assert.ok(verifySignature(k.publicKey, "hello", sig));
  assert.ok(!verifySignature(k.publicKey, "hell0", sig));
  assert.ok(!verifySignature(generateSigningKey().publicKey, "hello", sig));
});

test("hash chain detects edits, deletions and reordering", () => {
  const events: ChainedEvent[] = [];
  for (const type of ["MANDATE_SIGNED", "CART_PROPOSED", "PAYMENT_AUTHORIZED"]) {
    events.push(chainNext(events.at(-1) ?? null, { subjectId: "m1", type, payload: { type }, createdAt: "2026-10-17T00:00:00.000Z" }));
  }
  assert.equal(verifyChain(events), -1);
  assert.equal(verifyChain([{ ...events[0], payload: { type: "X" } }, ...events.slice(1)]), 0);
  assert.equal(verifyChain([events[0], events[2]]), 1);
  assert.equal(verifyChain([events[1], events[0], events[2]]), 0);
});

test("signed mandate verifies; any change to it breaks the signature", () => {
  const k = generateSigningKey();
  const now = new Date();
  const m = prepareMandate("black running shoes size 10 under $120", intent, k.publicKey, now);
  const sig = signMessage(k.privateKey, signingMessage(m));
  const ok = verifyMandate(m, sig, now);
  assert.deepEqual(ok, { ok: true, digest: mandateDigest(m) });

  const raised = { ...m, intent: { ...m.intent, maxPrice: 500 } };
  assert.deepEqual(verifyMandate(raised, sig, now), { ok: false, reason: "bad_signature" });
  const later = new Date(now.getTime() + 20 * 86_400_000);
  assert.deepEqual(verifyMandate(m, sig, later), { ok: false, reason: "created_at_out_of_range" });
});

test("a mandate can name the agent it authorizes; swapping the agent breaks the signature", () => {
  const k = generateSigningKey();
  const now = new Date();
  const m = prepareMandate("black hoodie size M under $80", intent, k.publicKey, now, { name: "Claude", verified: false });
  const sig = signMessage(k.privateKey, signingMessage(m));
  assert.equal(verifyMandate(m, sig, now).ok, true);
  assert.deepEqual(verifyMandate({ ...m, agent: { name: "Some Other Agent", verified: false } }, sig, now), { ok: false, reason: "bad_signature" });
  // Mandates signed before the field existed carry no `agent` key at all, so their digest is unchanged.
  const plain = prepareMandate("black hoodie size M under $80", intent, k.publicKey, now);
  assert.equal("agent" in plain, false);
});

test("drafts with open questions or no budget can't become mandates", () => {
  const key = generateSigningKey().publicKey;
  assert.throws(() => prepareMandate("x", { ...intent, mustAsk: ["What size?"] }, key), /open_questions/);
  assert.throws(() => prepareMandate("x", { ...intent, maxPrice: 0 }, key), /missing_budget/);
});

test("mandateToSearch carries the hard constraints", () => {
  const m = prepareMandate("x", intent, generateSigningKey().publicKey);
  assert.deepEqual(mandateToSearch(m), { query: "black running shoes", category: "running shoes", maxPrice: 120, color: "black", gender: undefined });
});

test("checkCart flags price, quantity and attribute violations only", () => {
  const m = prepareMandate("x", intent, generateSigningKey().publicKey);
  assert.deepEqual(checkCart(m, product()), []);
  const bad = checkCart(m, product({ price: 140, variant: { Size: "11", Color: "Black" } }), 2);
  assert.deepEqual(bad.map((v) => v.rule).sort(), ["attribute:size", "max_price", "quantity"]);
  // Unknown attribute values are not violations (left to the fuzzy layer).
  assert.deepEqual(checkCart(m, product({ variant: {} })), []);
  // A colorway that contains the wanted color is not a violation; a different size is.
  assert.deepEqual(checkCart(m, product({ variant: { Size: "10", Color: "Black/Black" } })), []);
  assert.deepEqual(checkCart(m, product({ variant: { Size: "10.5", Color: "Black" } })).map((v) => v.rule), ["attribute:size"]);
});
