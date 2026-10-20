import assert from "node:assert/strict";
import { test } from "node:test";
import { chainNext, generateSigningKey, sha256Hex, signMessage, type ChainedEvent } from "../src/lib/crypto";
import { undoSigningMessage } from "../src/lib/fault-core";
import { mandateDigest, prepareMandate, signingMessage } from "../src/lib/mandate";
import { availableTampers, tamper, verifyEvidence, type Evidence } from "../src/lib/verify";

/** A realistic chain built with the server's own code: signed mandate, purchase, signed undo, verdict, void. */
function buildEvidence(): Evidence {
  const key = generateSigningKey();
  const mandate = prepareMandate(
    "black hoodie size M under $80",
    { item: "hoodie", category: "hoodie", quantity: 1, maxPrice: 80, currency: "USD", attributes: { size: "M", color: "black" }, mustAsk: [] },
    key.publicKey,
    new Date("2026-10-20T08:00:00.000Z"),
  );
  const orderId = "11111111-2222-4333-8444-555555555555";
  const requestedAt = "2026-10-20T09:00:00.000Z";
  const reason = "This isn't what I asked for.";
  const steps: { type: string; payload: unknown }[] = [
    { type: "MANDATE_SIGNED", payload: { digest: mandateDigest(mandate), signature: signMessage(key.privateKey, signingMessage(mandate)) } },
    { type: "CHECKOUT_CREATED", payload: { orderId, amount: "60.00", currency: "USD", intent: "AUTHORIZE" } },
    { type: "PAYMENT_AUTHORIZED", payload: { orderId, amount: { value: "60.00", currency_code: "USD" } } },
    {
      type: "UNDO_REQUESTED",
      payload: { orderId, reason, requestedAt, photoSha256: null, signature: signMessage(key.privateKey, undoSigningMessage(orderId, reason, null, requestedAt)) },
    },
    { type: "VERDICT", payload: { orderId, verdict: "AGENT_FAULT", liability: "agent_operator", confidence: 1 } },
    { type: "PAYMENT_VOIDED", payload: { orderId, amount: { value: "60.00", currency_code: "USD" } } },
  ];
  const events: ChainedEvent[] = [];
  steps.forEach((s, i) => events.push(chainNext(events[i - 1] ?? null, { subjectId: mandate.id, ...s, createdAt: `2026-10-20T08:0${i}:00.000Z` })));
  // Round-trip through JSON, as the browser receives it.
  return JSON.parse(JSON.stringify({ format: "undo-evidence-v1", orderId, mandate, events }));
}

test("untouched evidence verifies: every hash, every link, both signatures", async () => {
  const report = await verifyEvidence(buildEvidence());
  assert.equal(report.brokenAt, -1);
  assert.ok(report.steps.every((s) => s.ok));
  assert.deepEqual(report.signatures.map((s) => [s.what, s.ok]), [["mandate", true], ["undo", true]]);
  assert.equal(report.ok, true);
});

test("the browser's SHA-256 matches the server's for the same text", async () => {
  const ev = buildEvidence();
  const report = await verifyEvidence(ev);
  assert.equal(report.steps[0].recomputed, ev.events[0].hash);
  assert.equal(sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("editing an amount breaks that step's hash", async () => {
  const report = await verifyEvidence(tamper(buildEvidence(), "amount"));
  assert.equal(report.brokenAt, 5);
  assert.equal(report.steps[5].problem, "hash");
  assert.equal(report.ok, false);
});

test("rewriting the verdict breaks the chain from that step on", async () => {
  const report = await verifyEvidence(tamper(buildEvidence(), "verdict"));
  assert.equal(report.brokenAt, 4);
  assert.ok(report.steps.slice(4).every((s) => !s.ok));
  assert.ok(report.steps.slice(0, 4).every((s) => s.ok));
});

test("changing who's at fault is caught even when the shopper was already blamed", async () => {
  const ev = buildEvidence();
  const verdict = ev.events.find((e) => e.type === "VERDICT")!.payload as Record<string, unknown>;
  verdict.verdict = "SHOPPER_CHANGED_MIND";
  verdict.liability = "shopper";
  // Re-seal this version honestly first, so only the tamper can break it.
  const resealed: Evidence["events"] = [];
  ev.events.forEach((e, i) => resealed.push(chainNext(resealed[i - 1] ?? null, { subjectId: e.subjectId, type: e.type, payload: e.payload, createdAt: e.createdAt })));
  const honest = { ...ev, events: resealed };
  assert.equal((await verifyEvidence(honest)).ok, true);
  assert.equal((await verifyEvidence(tamper(honest, "verdict"))).brokenAt, 4);
});

test("raising the signed budget leaves the chain intact but fails the shopper's signature", async () => {
  const report = await verifyEvidence(tamper(buildEvidence(), "budget"));
  assert.equal(report.brokenAt, -1);
  assert.equal(report.signatures.find((s) => s.what === "mandate")?.ok, false);
  assert.equal(report.ok, false);
});

test("deleting a step breaks the link to the one after it", async () => {
  const report = await verifyEvidence(tamper(buildEvidence(), "delete"));
  assert.equal(report.brokenAt, 3);
  assert.equal(report.steps[3].problem, "link");
});

test("tampering works on a copy and only offers what applies", () => {
  const ev = buildEvidence();
  const before = JSON.stringify(ev);
  tamper(ev, "verdict");
  assert.equal(JSON.stringify(ev), before);
  assert.deepEqual(availableTampers(ev), ["amount", "verdict", "budget", "delete"]);
  assert.deepEqual(availableTampers({ ...ev, mandate: null, events: ev.events.slice(0, 2) }), ["amount"]);
});
