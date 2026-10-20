import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_WINDOW_MINUTES } from "../src/lib/agent-core";
import { DEFAULT_RULES, newRecord, operatorOf, ruleEffect, scoreAgent, withRule, type AgentRecord } from "../src/lib/trust";

const record = (patch: Partial<AgentRecord>): AgentRecord => ({ ...newRecord({ name: "Test Agent", verified: true }), ...patch });

test("a new agent starts from its registration alone", () => {
  assert.equal(scoreAgent(record({})).score, 70);
  assert.equal(scoreAgent(record({ verified: false })).score, 50);
});

test("the score follows the record, explains every point, and stays between 0 and 100", () => {
  const good = scoreAgent(record({ purchases: 6 }));
  assert.equal(good.score, 88);
  assert.equal(good.tier, "trusted");
  assert.deepEqual(good.factors.map((f) => f.points), [70, 18]);

  const careless = scoreAgent(record({ verified: false, purchases: 5, faults: 4, bypassed: 4 }));
  assert.equal(careless.score, 0);
  assert.equal(careless.tier, "risky");
  assert.ok(careless.factors.some((f) => /agent-fault/.test(f.label) && f.points === -80));

  assert.equal(scoreAgent(record({ purchases: 40 })).score, 100); // clean purchases cap at +30
  assert.equal(scoreAgent(record({ refused: 3 })).score, 55);
});

test("blocking beats extending, and unregistered agents can be refused outright", () => {
  const risky = scoreAgent(record({ verified: false, faults: 1 })); // 30
  const op = { name: "Test Agent", verified: false };
  assert.equal(ruleEffect(op, risky, DEFAULT_RULES).extraMinutes, 360);
  assert.equal(ruleEffect(op, risky, DEFAULT_RULES).blocked, null);
  assert.match(ruleEffect(op, risky, { ...DEFAULT_RULES, blockBelow: 40 }).blocked ?? "", /below 40.*scores 30/);
  assert.match(ruleEffect(op, scoreAgent(record({ verified: false, purchases: 10 })), { ...DEFAULT_RULES, blockUnverified: true }).blocked ?? "", /registered/);
  // Rules off: nothing happens, whatever the score.
  assert.deepEqual(ruleEffect(op, risky, { blockBelow: null, extendBelow: null, extendMinutes: 60, blockUnverified: false }), { blocked: null, extraMinutes: 0, reason: null });
});

test("the merchant's extra time is its own visible line in the undo window, within the 48 h cap", () => {
  const window = { minutes: 60, factors: [{ factor: "order total $60.00", minutes: 60 }] };
  const effect = { blocked: null, extraMinutes: 360, reason: "merchant rule: Test Agent trust 30, below 50" };
  const longer = withRule(window, effect);
  assert.equal(longer.minutes, 420);
  assert.equal(longer.factors.at(-1)?.factor, effect.reason);
  assert.equal(withRule({ minutes: MAX_WINDOW_MINUTES, factors: [{ factor: "x", minutes: MAX_WINDOW_MINUTES }] }, effect).minutes, MAX_WINDOW_MINUTES);
  assert.equal(withRule(window, { blocked: null, extraMinutes: 0, reason: null }), window);
});

test("old orders without a recorded operator still belong to the right agent", () => {
  assert.deepEqual(operatorOf({ simulated: "unguarded_wrong_variant" }), { name: "Careless demo agent", verified: false, via: "web" });
  assert.deepEqual(operatorOf({}), { name: "Undo web agent", verified: true, via: "web" });
  assert.deepEqual(operatorOf({ operator: { name: "Claude", verified: false, via: "mcp" } }), { name: "Claude", verified: false, via: "mcp" });
});
