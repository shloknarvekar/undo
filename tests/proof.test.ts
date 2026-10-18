import assert from "node:assert/strict";
import { test } from "node:test";
import { proofFor, proofSummary } from "../src/lib/proof";

test("proof: PayPal steps name the exact API call and the PayPal id", () => {
  const p = proofFor("PAYMENT_REFUNDED", { captureId: "CAP1", refundId: "REF1", amount: { value: "59.99", currency_code: "USD" } });
  assert.equal(p.kind, "paypal");
  assert.equal(p.api, "POST /v2/payments/captures/{id}/refund");
  assert.equal(p.ref, "REF1");
  assert.match(p.how, /59\.99 USD/);
});

test("proof: a verdict splits its evidence into rules, AI and the shopper's own words", () => {
  const p = proofFor("VERDICT", {
    verdict: "AGENT_FAULT",
    confidence: 1,
    evidence: [
      { source: "shopper", finding: "Wrong colour." },
      { source: "mandate_check", finding: "attribute:color: mandate required black, agent bought grey" },
      { source: "agent_record", finding: "agent skipped Undo's pre-purchase check" },
      { source: "ai_judgement", finding: "intent unclear" },
    ],
  });
  assert.deepEqual(p.checks?.map((c) => c.by), ["person", "rule", "rule", "ai"]);
});

test("proof summary counts PayPal calls, rule checks, AI judgments and signatures", () => {
  const proofs = [
    proofFor("MANDATE_SIGNED", { digest: "d" }),
    proofFor("CART_PROPOSED", { agent: { guard: { bypassed: false }, model: "gemini", confidence: 0.8 }, risk: { minutes: 60 } }),
    proofFor("CHECKOUT_CREATED", { paypalOrderId: "O1" }),
    proofFor("PAYMENT_AUTHORIZED", { authorizationId: "A1" }),
    proofFor("PAYMENT_VOIDED", { authorizationId: "A1" }),
  ];
  assert.deepEqual(proofSummary(proofs), { signature: 1, rule: 2, ai: 1, paypal: 3, person: 0 });
});

test("proof: unknown events stay plain records and never throw", () => {
  assert.equal(proofFor("SOMETHING_NEW", null).kind, "record");
});
