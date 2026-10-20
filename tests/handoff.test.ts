import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { PHOTO_DATA_URL, hashToken, photoDigest } from "../src/lib/handoff";

// A real 1×1 JPEG, as a phone would send after downscaling.
const JPEG =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==";

test("only a hash of the one-time token is stored, and it is stable", () => {
  assert.equal(hashToken("abc"), createHash("sha256").update("abc").digest("hex"));
  assert.notEqual(hashToken("abc"), hashToken("abd"));
  assert.equal(hashToken("abc").length, 64);
});

test("the photo's hash is the one the computer signs and the undo route recomputes", () => {
  const { bytes, sha256 } = photoDigest(JPEG);
  const b64 = JPEG.split(",")[1];
  assert.deepEqual(bytes, Buffer.from(b64, "base64"));
  assert.equal(sha256, createHash("sha256").update(Buffer.from(b64, "base64")).digest("hex"));
});

test("only JPEG, PNG and WebP data URLs are accepted", () => {
  assert.ok(PHOTO_DATA_URL.test(JPEG));
  assert.ok(PHOTO_DATA_URL.test("data:image/png;base64,iVBORw0KGgo="));
  for (const bad of ["data:image/svg+xml;base64,PHN2Zz4=", "data:text/html;base64,PGgxPg==", "https://example.test/x.jpg", "data:image/jpeg;base64,<script>"]) {
    assert.equal(PHOTO_DATA_URL.test(bad), false, bad);
  }
});
