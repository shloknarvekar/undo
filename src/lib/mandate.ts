/**
 * Intent mandates: what the shopper allowed the agent to buy, signed by the shopper's key.
 * Shape is AP2-inspired (intent mandate → cart → payment). Pure logic, no I/O.
 *
 * Flow: text → IntentDraft (LLM, see mandate-parser.ts) → prepareMandate() → shopper signs signingMessage()
 *       → server verifyMandate() → stored. Every later step (cart, undo, refund) is checked against it.
 */
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { canonicalJson, sha256Hex, verifySignature } from "./crypto";
import type { StoreProduct } from "./channel3";

/** What the shopper asked for, structured. Produced by the parser, edited/confirmed by the shopper. */
export const IntentDraft = z.object({
  item: z.string().min(1).max(120).describe("Short noun phrase for the product, e.g. 'running shoes'"),
  category: z.string().max(60).optional().describe("Product category in plain words, e.g. 'running shoes'"),
  quantity: z.number().int().min(1).max(20).default(1),
  maxPrice: z.number().nonnegative().describe("Hard ceiling per item, in currency units; 0 if the shopper gave no budget"),
  currency: z.string().length(3).default("USD"),
  attributes: z
    .record(z.string(), z.string())
    .default({})
    .describe("Required variant/attribute values, keys lowercase: size, color, material, …"),
  gender: z.enum(["male", "female"]).optional(),
  brands: z.array(z.string()).max(10).optional().describe("Only these brands, if the shopper named any"),
  deadline: z.string().optional().describe("ISO date the item must arrive by, if stated"),
  notes: z.string().max(300).optional().describe("Soft preferences that are not hard constraints"),
  mustAsk: z
    .array(z.string())
    .max(5)
    .default([])
    .describe("Questions the agent must ask before buying because the request is ambiguous"),
});
export type IntentDraft = z.infer<typeof IntentDraft>;

export const MANDATE_VERSION = 1;
const MANDATE_TTL_DAYS = 14;

export const IntentMandate = z.object({
  version: z.literal(MANDATE_VERSION),
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  shopperKey: z.string().min(40).max(60), // base64 of a 32-byte Ed25519 public key
  request: z.string().max(1000), // the shopper's own words, kept verbatim as evidence
  intent: IntentDraft,
});
export type IntentMandate = z.infer<typeof IntentMandate>;

/** A draft can be signed only when every agent question is answered and there is a real budget. */
export function readyToSign(d: IntentDraft): { ok: true } | { ok: false; reason: "open_questions" | "missing_budget" } {
  if (d.mustAsk.length) return { ok: false, reason: "open_questions" };
  if (!(d.maxPrice > 0)) return { ok: false, reason: "missing_budget" };
  return { ok: true };
}

export function prepareMandate(request: string, intent: IntentDraft, shopperKey: string, now = new Date()): IntentMandate {
  const ready = readyToSign(IntentDraft.parse(intent));
  if (!ready.ok) throw new Error(`Draft not ready to sign: ${ready.reason}`);
  const expires = new Date(now.getTime() + MANDATE_TTL_DAYS * 86_400_000);
  return IntentMandate.parse({
    version: MANDATE_VERSION,
    id: randomUUID(),
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    shopperKey,
    request,
    intent: IntentDraft.parse(intent),
  });
}

export function mandateDigest(m: IntentMandate): string {
  return sha256Hex(canonicalJson(m));
}

/** The exact string the shopper's key signs. Domain-separated so a mandate signature can't be replayed elsewhere. */
export function signingMessage(m: IntentMandate): string {
  return `undo-intent-mandate-v${m.version}:${mandateDigest(m)}`;
}

export type MandateCheck = { ok: true; digest: string } | { ok: false; reason: string };

export function verifyMandate(m: IntentMandate, signature: string, now = new Date()): MandateCheck {
  const parsed = IntentMandate.safeParse(m);
  if (!parsed.success) return { ok: false, reason: "malformed_mandate" };
  const created = Date.parse(m.createdAt);
  if (Math.abs(now.getTime() - created) > 15 * 60_000) return { ok: false, reason: "created_at_out_of_range" };
  if (Date.parse(m.expiresAt) <= now.getTime()) return { ok: false, reason: "expired" };
  const ready = readyToSign(m.intent);
  if (!ready.ok) return ready;
  if (!verifySignature(m.shopperKey, signingMessage(m), signature)) return { ok: false, reason: "bad_signature" };
  return { ok: true, digest: mandateDigest(m) };
}

/** Mandate → the product search the agent is allowed to run (feeds POST /api/products/search). */
export function mandateToSearch(m: IntentMandate) {
  const { intent } = m;
  return {
    query: [intent.attributes.color, intent.item].filter(Boolean).join(" "),
    category: intent.category ?? intent.item,
    maxPrice: intent.maxPrice,
    color: intent.attributes.color,
    gender: intent.gender,
  };
}

export type Violation = { rule: string; expected: string; actual: string };

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Deterministic checks of a candidate cart line against the mandate — the first layer of the fault engine.
 * Fuzzy questions ("is this 'black'?") are left to the LLM layer; this only flags what is certain.
 */
export function checkCart(m: IntentMandate, product: StoreProduct, quantity = 1, now = new Date()): Violation[] {
  const v: Violation[] = [];
  const { intent } = m;
  if (Date.parse(m.expiresAt) <= now.getTime()) v.push({ rule: "mandate_active", expected: `before ${m.expiresAt}`, actual: now.toISOString() });
  if (product.currency !== intent.currency) v.push({ rule: "currency", expected: intent.currency, actual: product.currency });
  if (product.price > intent.maxPrice) v.push({ rule: "max_price", expected: `≤ ${intent.maxPrice}`, actual: String(product.price) });
  if (quantity !== intent.quantity) v.push({ rule: "quantity", expected: String(intent.quantity), actual: String(quantity) });
  if (intent.brands?.length && !intent.brands.some((b) => product.brand && norm(b) === norm(product.brand))) {
    v.push({ rule: "brand", expected: intent.brands.join(" | "), actual: product.brand ?? "unknown" });
  }
  // Attribute checks only where the product states a value for that dimension.
  const stated: Record<string, string> = {};
  for (const [k, val] of Object.entries(product.variant)) stated[norm(k)] = val;
  for (const [k, vals] of Object.entries(product.attributes)) if (!stated[norm(k)] && vals[0]) stated[norm(k)] = vals[0];
  for (const [key, wanted] of Object.entries(intent.attributes)) {
    const actual = stated[norm(key)];
    if (actual !== undefined && norm(actual) !== norm(wanted)) v.push({ rule: `attribute:${norm(key)}`, expected: wanted, actual });
  }
  return v;
}
