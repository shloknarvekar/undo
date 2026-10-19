import assert from "node:assert/strict";
import { test } from "node:test";
import { humanWait, slidingWindow, visitorId } from "../src/lib/usage";

const MIN = 60_000;

test("sliding window allows up to the limit, then says how long to wait", () => {
  const store = new Map<string, number[]>();
  const t0 = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(slidingWindow(store, "v", [{ max: 3, ms: MIN }], t0 + i * 1000), 0);
  // Fourth hit at t0+5s: the first hit (t0) leaves the window at t0+60s, so wait 55s.
  assert.equal(slidingWindow(store, "v", [{ max: 3, ms: MIN }], t0 + 5_000), 55);
  // A refused hit isn't recorded: once the first hit expires, exactly one slot frees up.
  assert.equal(slidingWindow(store, "v", [{ max: 3, ms: MIN }], t0 + MIN), 0);
  assert.ok(slidingWindow(store, "v", [{ max: 3, ms: MIN }], t0 + MIN + 1) > 0);
});

test("the strictest of several windows wins, and visitors are independent", () => {
  const store = new Map<string, number[]>();
  const windows = [{ max: 5, ms: MIN }, { max: 6, ms: 60 * MIN }];
  const t0 = 5_000_000;
  for (let i = 0; i < 5; i++) assert.equal(slidingWindow(store, "a", windows, t0 + i), 0);
  assert.ok(slidingWindow(store, "a", windows, t0 + 10) > 0); // minute window full
  assert.equal(slidingWindow(store, "a", windows, t0 + 2 * MIN), 0); // sixth in the hour
  const wait = slidingWindow(store, "a", windows, t0 + 3 * MIN); // hour window full now
  assert.ok(wait > 50 * 60, `expected to wait most of the hour, got ${wait}s`);
  assert.equal(slidingWindow(store, "b", windows, t0 + 3 * MIN), 0);
});

test("wait times read naturally", () => {
  assert.equal(humanWait(1), "1 second");
  assert.equal(humanWait(45), "45 seconds");
  assert.equal(humanWait(61), "2 minutes");
  assert.equal(humanWait(3_600), "1 hour");
  assert.equal(humanWait(7_201), "3 hours");
});

test("visitor id prefers the proxy's own header over a client-supplied forwarded-for", () => {
  const req = (h: Record<string, string>) => new Request("http://x/", { headers: h });
  assert.equal(visitorId(req({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "9.9.9.9" })), "1.1.1.1");
  assert.equal(visitorId(req({ "x-forwarded-for": "2.2.2.2, 10.0.0.1" })), "2.2.2.2");
  assert.equal(visitorId(req({})), "local");
});
