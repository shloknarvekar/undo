import assert from "node:assert/strict";
import { test } from "node:test";
import { decide, route, type Findings } from "../src/lib/fault-core";

const clean: Findings = {
  cartViolations: [],
  guardBypassed: false,
  relaxed: [],
  delivered: null,
  intent: null,
  shopperReason: "not what I wanted",
};

test("certain mandate violations are agent fault, whatever the AI says", () => {
  const d = decide({
    ...clean,
    guardBypassed: true,
    cartViolations: [{ rule: "attribute:size", expected: "10", actual: "10.5" }],
    delivered: { matchesOrder: true, mismatches: [], confidence: 0.99 },
  });
  assert.equal(d.verdict, "AGENT_FAULT");
  assert.equal(d.confidence, 1);
  assert.equal(d.liability, "agent_operator");
  assert.ok(d.evidence.some((e) => e.finding.includes("size")));
});

test("wrong item delivered is merchant fault; weak photo evidence is not enough", () => {
  const bad = { matchesOrder: false, mismatches: ["navy, not black"], confidence: 0.92 };
  assert.equal(decide({ ...clean, delivered: bad }).verdict, "MERCHANT_FAULT");
  assert.equal(decide({ ...clean, delivered: { ...bad, confidence: 0.5 } }).verdict, "INCONCLUSIVE");
});

test("fuzzy intent mismatch is agent fault; everything fine is changed mind", () => {
  assert.equal(decide({ ...clean, intent: { satisfiesMandate: false, problems: ["charcoal is not black"], confidence: 0.8 } }).verdict, "AGENT_FAULT");
  const ok = decide({ ...clean, intent: { satisfiesMandate: true, problems: [], confidence: 0.9 }, delivered: { matchesOrder: true, mismatches: [], confidence: 0.85 } });
  assert.equal(ok.verdict, "SHOPPER_CHANGED_MIND");
  assert.equal(ok.liability, "shopper");
  assert.equal(ok.confidence, 0.85);
});

test("route: inside the window everything is a void; after capture it depends on the verdict", () => {
  for (const v of ["AGENT_FAULT", "MERCHANT_FAULT", "SHOPPER_CHANGED_MIND", "INCONCLUSIVE"] as const) {
    assert.equal(route(v, "AUTHORIZED", "39.99").type, "VOID");
  }
  assert.equal(route("AGENT_FAULT", "CAPTURED", "39.99").type, "REFUND_FULL");
  assert.equal(route("MERCHANT_FAULT", "CAPTURED", "39.99").type, "OPEN_CLAIM");
  assert.deepEqual(route("SHOPPER_CHANGED_MIND", "CAPTURED", "40.00"), {
    type: "AUTHORIZE_RETURN",
    refundOnReturn: "34.00",
    restockingFee: "6.00",
    reason: "agent and merchant followed the mandate: merchant protected, refund on return minus restocking fee",
  });
  assert.equal(route("INCONCLUSIVE", "CAPTURED", "39.99").type, "REVIEW");
  assert.equal(route("AGENT_FAULT", "VOIDED", "39.99").type, "NONE");
});
