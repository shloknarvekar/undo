import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_WINDOW_MINUTES, matchVariant, neighbouringVariant, undoWindow, withTextEvidence } from "../src/lib/agent-core";

const options = [
  { name: "Size", values: ["9", "9.5", "10", "10.5", "11"] },
  { name: "Color", values: ["Core Black / White", "Cloud White", "Navy"] },
];

test("matchVariant: exact, loose, missing and unverifiable attributes", () => {
  const m = matchVariant({ size: "10", color: "black", material: "leather" }, options);
  assert.deepEqual(m.requested, { Size: "10", Color: "Core Black / White" });
  assert.deepEqual(m.approximate, [{ attribute: "color", wanted: "black", label: "Core Black / White" }]);
  assert.deepEqual(m.unverifiable, ["material"]);
  assert.deepEqual(matchVariant({ size: "12" }, options).missing, [{ attribute: "size", wanted: "12" }]);
});

test("matchVariant: '10' never matches '10.5' or '110'", () => {
  const m = matchVariant({ size: "10" }, [{ name: "Shoe Size", values: ["10.5", "110", "US 10"] }]);
  assert.deepEqual(m.requested, { "Shoe Size": "US 10" });
});

test("withTextEvidence: title/attribute mentions become approximate, never exact", () => {
  const m = matchVariant({ size: "M", color: "black" }, [{ name: "Size", values: ["S", "M", "L"] }]);
  assert.deepEqual(m.unverifiable, ["color"]);
  const e = withTextEvidence(m, { size: "M", color: "black" }, "HOODIE IN BLACK", {});
  assert.deepEqual(e.unverifiable, []);
  assert.equal(e.approximate[0].attribute, "color");
  assert.deepEqual(withTextEvidence(m, { size: "M", color: "black" }, "Mens Boxy Hoodie", {}).unverifiable, ["color"]);
  assert.deepEqual(withTextEvidence(m, { size: "M", color: "black" }, "Boxy Hoodie", { color: ["Jet Black"] }).unverifiable, []);
});

test("neighbouringVariant picks the adjacent label of the first requested option", () => {
  assert.deepEqual(neighbouringVariant({ Size: "10", Color: "Navy" }, options), { Size: "10.5", Color: "Navy" });
  assert.equal(neighbouringVariant({ Size: "10" }, [{ name: "Size", values: ["10"] }]), null);
});

test("undoWindow: cheap and certain captures now; uncertainty lengthens; capped at 48h", () => {
  const base = { quantity: 1, confidence: 0.9, approximate: 0, unverifiable: 0, relaxed: 0, guardBypassed: false };
  assert.equal(undoWindow({ ...base, price: 12 }).minutes, 0);
  assert.equal(undoWindow({ ...base, price: 64 }).minutes, 60);
  assert.equal(undoWindow({ ...base, price: 64, approximate: 1 }).minutes, 60 + 180);
  assert.equal(undoWindow({ ...base, price: 400, confidence: 0.5, relaxed: 1, guardBypassed: true, unverifiable: 2 }).minutes, MAX_WINDOW_MINUTES);
});
