/**
 * Rogue agents: eight agents try to act on one signed mandate, and Undo's real guard decides each one.
 *
 * Nothing here is mocked. The mandate is genuinely Ed25519-signed (by a throwaway demo key, never stored), the
 * products are fetched live from Channel3, and every verdict comes from the same functions the web shop and the MCP
 * server use: evaluateProduct, checkCart, verifyMandate, agentMayUse. No order or PayPal checkout is created.
 */
import { evaluateProduct, searchWithinMandate } from "./agent";
import { searchProducts, toStoreProduct, type StoreProduct } from "./channel3";
import { generateSigningKey, sha256Hex, signMessage } from "./crypto";
import { QuotaExceeded, cacheGet, cachePut } from "./usage";
import { agentMayUse, checkCart, prepareMandate, signingMessage, verifyMandate, type IntentDraft, type Violation } from "./mandate";

export type AttackResult = {
  id: string;
  agent: string;
  tactic: string;
  tried: string;
  blocked: boolean;
  /** What stopped it (or "none" for the agent that was allowed through). */
  by: "price" | "variant" | "quantity" | "signature" | "expiry" | "binding" | "none";
  reason: string;
  ms: number;
};

export type RogueRun = {
  mandate: { request: string; limits: string; authorizes: string; signedBy: string; digest: string };
  results: AttackResult[];
  ranAt: string;
  /** Set when this is the last good run replayed, because the catalog budget is used up ("budget") or the live run failed ("error"). */
  replay?: "budget" | "error";
};

const REQUEST = "A black hoodie, size M, under $80";
const DRAFT: IntentDraft = { item: "hoodie", category: "hoodie", quantity: 1, maxPrice: 80, currency: "USD", attributes: { size: "M", color: "black" }, mustAsk: [] };
const AUTHORIZED = { name: "Careful Claude", verified: true };

const describe = (p: StoreProduct) =>
  `${p.title} · $${p.price.toFixed(2)}${Object.keys(p.variant).length ? ` · ${Object.entries(p.variant).map(([k, v]) => `${k} ${v}`).join(", ")}` : ""}`;
const explain = (v: Violation) => `${v.rule.replace("attribute:", "").replace("_", " ")}: mandate says ${v.expected}, agent tried ${v.actual}`;
const optionName = (p: StoreProduct, re: RegExp, fallback: string) => p.variantOptions.find((o) => re.test(o.name))?.name ?? fallback;

async function timed(fn: () => Promise<Omit<AttackResult, "ms">>): Promise<AttackResult> {
  const t = Date.now();
  const r = await fn();
  return { ...r, ms: Date.now() - t };
}

let cache: { at: number; run: RogueRun } | null = null;
let inflight: Promise<RogueRun> | null = null;
const FRESH_MS = 5 * 60_000; // catalog searches cost credits: a run is reused for five minutes
const CACHE_KEY = "rogue:last-run";

/**
 * The latest run. Fresh runs are shared (one at a time, reused for five minutes, kept in the database across restarts).
 * If the catalog budget is used up or the live run fails, the last good run is replayed and marked as such.
 */
export async function runRogueAgents(): Promise<RogueRun> {
  if (!cache) {
    const saved = await cacheGet<RogueRun>(CACHE_KEY);
    if (saved) cache = { at: saved.at.getTime(), run: saved.value };
  }
  if (cache && Date.now() - cache.at < FRESH_MS) return cache.run;
  inflight ??= freshRun()
    .then(async (run) => {
      cache = { at: Date.now(), run };
      await cachePut(CACHE_KEY, run);
      return run;
    })
    .finally(() => {
      inflight = null;
    });
  try {
    return await inflight;
  } catch (err) {
    if (cache) return { ...cache.run, replay: err instanceof QuotaExceeded ? "budget" : "error" };
    throw err;
  }
}

async function freshRun(): Promise<RogueRun> {
  const key = generateSigningKey();
  const mandate = prepareMandate(REQUEST, DRAFT, key.publicKey, new Date(), AUTHORIZED);
  const signature = signMessage(key.privateKey, signingMessage(mandate));
  const signed = verifyMandate(mandate, signature);
  if (!signed.ok) throw new Error(`demo mandate didn't verify: ${signed.reason}`);

  // The product an honest agent would buy: live, in stock, inside the limits, and passing the guard in size M.
  // Candidates are checked in parallel (one live fetch each), then the first that passes is used.
  const candidates = (await searchWithinMandate(mandate, undefined, 6)).slice(0, 4);
  const checked = await Promise.all(
    candidates.map(async (p) => {
      const sizeKey = optionName(p, /size/i, "Size");
      const c = await evaluateProduct(mandate, p.channel3Id, { [sizeKey]: "M" }).catch(() => null);
      return c?.ok ? { product: c.product, sizeKey } : null;
    }),
  );
  const honest = checked.find((x) => x !== null) ?? null;
  if (!honest) throw new Error("No live product passes the mandate right now; try again in a minute.");
  const { product, sizeKey } = honest;
  const colourKey = optionName(product, /colou?r/i, "Color");

  const results = await Promise.all([
    timed(async () => {
      const [over] = (await searchProducts("black hoodie", { limit: 6, filters: { price: { min_price: 81, max_price: 400 } } })).map(toStoreProduct).filter((p): p is StoreProduct => p !== null);
      const v = over ? checkCart(mandate, over, 1).find((x) => x.rule === "max_price") : undefined;
      return {
        id: "upsell",
        agent: "Upsell Bot",
        tactic: "Talks itself into the nicer, pricier hoodie.",
        tried: over ? describe(over) : "a hoodie over $80",
        blocked: true,
        by: "price",
        reason: v ? explain(v) : "price: mandate says ≤ 80",
      };
    }),
    timed(async () => {
      const c = await evaluateProduct(mandate, product.channel3Id, { [sizeKey]: "XL" });
      const v = c?.violations.find((x) => x.rule.includes("size"));
      return { id: "size", agent: "Close Enough", tactic: "M is sold out-ish, so it grabs an XL.", tried: `${product.title} in ${sizeKey} XL`, blocked: !c?.ok, by: "variant", reason: v ? explain(v) : "size: mandate says M" };
    }),
    timed(async () => {
      const c = await evaluateProduct(mandate, product.channel3Id, { [colourKey]: "Grey" });
      const v = c?.violations.find((x) => x.rule.includes("col"));
      return { id: "colour", agent: "Colour Blind", tactic: "Decides grey is basically black.", tried: `${product.title} in ${colourKey} Grey`, blocked: !c?.ok, by: "variant", reason: v ? explain(v) : "color: mandate says black" };
    }),
    timed(async () => {
      const v = checkCart(mandate, product, 3).find((x) => x.rule === "quantity");
      return { id: "bulk", agent: "Bulk Buyer", tactic: "Buys three, \"just in case\".", tried: `3 × ${describe(product)}`, blocked: Boolean(v), by: "quantity", reason: v ? explain(v) : "quantity: mandate says 1" };
    }),
    timed(async () => {
      const tampered = { ...mandate, intent: { ...mandate.intent, maxPrice: 800 } };
      const check = verifyMandate(tampered, signature);
      return {
        id: "tamper",
        agent: "Budget Hacker",
        tactic: "Edits the signed mandate's budget from $80 to $800.",
        tried: "the shopper's mandate with maxPrice 800, original signature attached",
        blocked: !check.ok,
        by: "signature",
        reason: check.ok ? "signature still verified" : `${check.reason.replace("_", " ")}: the edited bytes no longer match what the shopper signed`,
      };
    }),
    timed(async () => {
      const later = new Date(Date.now() + 20 * 86_400_000);
      const v = checkCart(mandate, product, 1, later).find((x) => x.rule === "mandate_active");
      return {
        id: "late",
        agent: "Late Shopper",
        tactic: "Comes back three weeks later and uses the same mandate.",
        tried: `${describe(product)} on ${later.toDateString()}`,
        blocked: Boolean(v),
        by: "expiry",
        reason: v ? `mandate expired: valid until ${new Date(mandate.expiresAt).toDateString()}` : "mandate still active",
      };
    }),
    timed(async () => {
      const may = agentMayUse(mandate, { name: "Shady Agent", verified: false });
      return {
        id: "impersonate",
        agent: "Impersonator",
        tactic: "Grabs a mandate that was signed for a different agent.",
        tried: `the mandate signed for ${AUTHORIZED.name}, presented by "Shady Agent"`,
        blocked: !may.ok,
        by: "binding",
        reason: may.ok ? "allowed" : may.reason,
      };
    }),
    timed(async () => {
      const c = await evaluateProduct(mandate, product.channel3Id, { [sizeKey]: "M" });
      const may = agentMayUse(mandate, AUTHORIZED);
      const ok = Boolean(c?.ok) && may.ok;
      return {
        id: "honest",
        agent: AUTHORIZED.name,
        tactic: "Buys exactly what the shopper signed, as the agent the shopper named.",
        tried: describe(c?.product ?? product),
        blocked: !ok,
        by: "none",
        reason: ok
          ? `Passes every rule${c?.match.unverifiable.length ? ` (couldn't verify ${c.match.unverifiable.join(", ")} from the listing, so the undo window gets longer)` : ""}. Undo would open an authorize-only PayPal checkout.`
          : (c?.violations.map(explain).join("; ") ?? "refused"),
      };
    }),
  ]);

  return {
    mandate: {
      request: REQUEST,
      limits: "black · size M · ≤ $80 · quantity 1 · 14 days",
      authorizes: AUTHORIZED.name,
      signedBy: sha256Hex(key.publicKey).slice(0, 12),
      digest: signed.digest,
    },
    results,
    ranAt: new Date().toISOString(),
  };
}
