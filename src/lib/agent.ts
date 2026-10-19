/**
 * The shopping agent. Given a signed mandate it:
 *   1. searches Channel3 with the mandate's hard constraints as structured filters,
 *   2. re-fetches each candidate fresh (free call) resolved to the mandate's variant (size/color…),
 *   3. runs Undo's guard on every candidate: deterministic mandate checks + catalog substitution detection,
 *   4. lets Gemini choose among the candidates that passed, with reasoning and a confidence score.
 *
 * The AI only ranks; it can never pick a candidate the guard rejected. `simulate: "unguarded_wrong_variant"`
 * stands in for a third-party agent that skips the guard — used to demo what Undo does after a bad purchase.
 */
import { generateText, Output } from "ai";
import { z } from "zod";
import { aiModel } from "./ai";
import { containsToken, matchVariant, neighbouringVariant, withTextEvidence, type VariantMatch } from "./agent-core";
import { colorFilter, getProduct, relaxedOptions, resolveCategory, searchProducts, toStoreProduct, type StoreProduct } from "./channel3";
import { checkCart, mandateToSearch, type IntentMandate, type Violation } from "./mandate";

const SEARCH_LIMIT = 12;
const DETAIL_LIMIT = 6;
const PICK_LIMIT = 5;

export type Simulation = "unguarded_wrong_variant";

export type Candidate = {
  product: StoreProduct;
  match: VariantMatch;
  relaxed: { option: string; requested: string; resolved: string | null }[];
  violations: Violation[];
  ok: boolean;
};

export type AgentDecision = {
  chosen: Candidate;
  reasoning: string;
  confidence: number;
  unverified: string[];
  guard: { bypassed: boolean; violations: Violation[]; relaxed: Candidate["relaxed"] };
  considered: { id: string; title: string; price: number; ok: boolean; why?: string }[];
  searches: { query: string; filters: string }[];
  model: string | null;
};

export class NoCompliantProduct extends Error {
  constructor(public considered: AgentDecision["considered"]) {
    super("No product satisfies the mandate");
  }
}

async function search(mandate: IntentMandate, query?: string) {
  const s = { ...mandateToSearch(mandate), ...(query ? { query } : {}) };
  const slug = s.category ? await resolveCategory(s.category) : null;
  const base = { price: { max_price: s.maxPrice }, ...(s.gender ? { gender: s.gender } : {}) };
  // Strictest first; color filters are fuzzy and categories can be narrow, so relax them in turn.
  const attempts = [
    { ...base, ...(slug ? { category_ids: [slug] } : {}), ...(s.color ? { colors: colorFilter(s.color) } : {}) },
    { ...base, ...(slug ? { category_ids: [slug] } : {}) },
    base,
  ];
  const searches: AgentDecision["searches"] = [];
  for (const filters of attempts) {
    const results = await searchProducts(s.query, { limit: SEARCH_LIMIT, filters });
    searches.push({ query: s.query, filters: Object.keys(filters).join("+") });
    if (results.length) return { results, searches };
  }
  return { results: [], searches };
}

async function evaluate(
  mandate: IntentMandate,
  p: StoreProduct,
  pick?: (m: VariantMatch) => Record<string, string> | null,
  /** An outside agent named the variant itself: check what it picked even if the mandate's variant isn't offered. */
  agentPicked = false,
): Promise<Candidate | null> {
  const match = matchVariant(mandate.intent.attributes, p.variantOptions);
  if (match.missing.length && !agentPicked) return null; // the listing can't be had in the requested size/color at all
  const requested = pick ? pick(match) : match.requested;
  if (!requested) return null;
  const detail = await getProduct(p.channel3Id, Object.keys(requested).length ? requested : undefined).catch(() => null);
  const fresh = detail && toStoreProduct(detail);
  if (!fresh) return null;
  const relaxed = relaxedOptions(requested, detail);
  const violations = checkCart(mandate, fresh, mandate.intent.quantity);
  const evidenced = withTextEvidence(match, mandate.intent.attributes, fresh.title, fresh.attributes);
  return { product: fresh, match: evidenced, relaxed, violations, ok: violations.length === 0 && relaxed.length === 0 };
}

const Pick = z.object({
  index: z.number().int().min(0).describe("Index of the chosen candidate"),
  confidence: z.number().min(0).max(1).describe("How sure you are this is what the shopper meant"),
  reasoning: z.string().max(400).describe("One or two sentences the shopper will read"),
  unverified: z.array(z.string()).max(5).describe("Mandate requirements you could not confirm from the listing"),
});

async function choose(mandate: IntentMandate, candidates: Candidate[]) {
  const listing = candidates.map((c, i) => ({
    index: i,
    title: c.product.title,
    brand: c.product.brand,
    price: c.product.price,
    confirmedVariant: c.product.variant,
    attributes: c.product.attributes,
    looselyMatched: c.match.approximate,
    notExposedByListing: c.match.unverifiable,
    retailer: c.product.sourceDomain,
  }));
  try {
    const { output } = await generateText({
      model: await aiModel(),
      system:
        "You are a careful shopping agent. Every candidate already satisfies the shopper's hard limits. " +
        "Pick the one that best matches what the shopper meant, preferring exact variant matches, then value. " +
        "Be honest about anything you could not verify. Never invent facts that are not in the listing. " +
        "Write the reasoning to the shopper in plain words; never refer to candidates by number or index.",
      prompt: JSON.stringify({ shopperRequest: mandate.request, mandate: mandate.intent, candidates: listing }),
      output: Output.object({ schema: Pick, name: "agent_pick" }),
      temperature: 0,
      maxRetries: 1,
    });
    const index = output.index < candidates.length ? output.index : 0;
    return { ...output, index, model: process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest" };
  } catch (err) {
    // The AI ranks; it isn't load-bearing. Fall back to the cheapest exact match so checkout still works.
    console.error("agent pick fell back to rules:", err instanceof Error ? err.message : err);
    const loose = (c: Candidate) => c.match.approximate.length;
    const index = candidates.reduce((best, c, i) => {
      const b = candidates[best];
      return loose(c) < loose(b) || (loose(c) === loose(b) && c.product.price < b.product.price) ? i : best;
    }, 0);
    return {
      index,
      confidence: 0.5,
      reasoning: "Chose the closest exact match at the lowest price (AI ranking unavailable).",
      unverified: candidates[index].match.unverifiable,
      model: null,
    };
  }
}

/**
 * For outside agents (MCP): search the catalog, but only inside the mandate's hard limits (price ceiling,
 * colour, category, gender). The agent may phrase its own query; it can't widen the filters.
 */
export async function searchWithinMandate(mandate: IntentMandate, query?: string, limit = 8) {
  const { results } = await search(mandate, query);
  return results
    .map(toStoreProduct)
    .filter((p): p is StoreProduct => p !== null)
    .slice(0, limit);
}

/**
 * For outside agents (MCP): run Undo's guard on one specific product. Fetches it fresh, resolved to the variant the
 * agent asked for (or, if it named none, the variant the mandate requires), then checks it against the mandate.
 * Returns null when the listing can't be had in the requested variant at all.
 */
export async function evaluateProduct(mandate: IntentMandate, productId: string, options?: Record<string, string>): Promise<Candidate | null> {
  const listing = await getProduct(productId).catch(() => null);
  const p = listing && toStoreProduct(listing);
  if (!p) return null;
  if (!options || !Object.keys(options).length) return evaluate(mandate, p);

  // What the agent explicitly chose is checked against the mandate on its own: "3XS" when the shopper signed "M"
  // is a violation even if this retailer can't resolve sizes at all.
  const wanted = Object.fromEntries(Object.entries(mandate.intent.attributes).map(([k, v]) => [k.toLowerCase(), v]));
  const conflicts: Violation[] = Object.entries(options)
    .filter(([k, v]) => wanted[k.toLowerCase()] !== undefined && !containsToken(v, wanted[k.toLowerCase()]))
    .map(([k, v]) => ({ rule: `attribute:${k.toLowerCase()}`, expected: wanted[k.toLowerCase()], actual: `${v} (agent's choice)` }));

  // Only ask the retailer for dimensions it can resolve; the rest stay with the mandate and count as unverified.
  const resolvable = new Map(p.variantOptions.filter((o) => o.values.length).map((o) => [o.name.toLowerCase(), o.name]));
  const c = await evaluate(mandate, p, (m) => {
    const chosen = { ...m.requested };
    for (const [k, v] of Object.entries(options)) {
      const name = resolvable.get(k.toLowerCase());
      if (name) chosen[name] = v;
    }
    return chosen;
  }, true);
  if (!c) return null;
  const violations = [...conflicts, ...c.violations];
  return { ...c, violations, ok: violations.length === 0 && c.relaxed.length === 0 };
}

export async function runAgent(mandate: IntentMandate, opts: { simulate?: Simulation } = {}): Promise<AgentDecision> {
  const { results, searches } = await search(mandate);
  const products = results.map(toStoreProduct).filter((p): p is StoreProduct => p !== null);

  if (opts.simulate === "unguarded_wrong_variant") {
    for (const p of products.slice(0, DETAIL_LIMIT)) {
      const c = await evaluate(mandate, p, (m) => neighbouringVariant(m.requested, p.variantOptions));
      if (!c) continue;
      return {
        chosen: c,
        reasoning: `Picked ${c.product.title} in ${Object.values(c.product.variant).join(" / ") || "the listed variant"} — looked like the best match.`,
        confidence: 0.9,
        unverified: [],
        guard: { bypassed: true, violations: c.violations, relaxed: c.relaxed },
        considered: [{ id: c.product.channel3Id, title: c.product.title, price: c.product.price, ok: c.ok }],
        searches,
        model: null,
      };
    }
    throw new NoCompliantProduct([]);
  }

  const evaluated = await Promise.all(products.slice(0, DETAIL_LIMIT).map((p) => evaluate(mandate, p)));
  const considered: AgentDecision["considered"] = products.slice(0, DETAIL_LIMIT).map((p, i) => {
    const c = evaluated[i];
    const why = !c
      ? "requested size/color not offered"
      : c.relaxed.length
        ? `catalog substituted ${c.relaxed.map((r) => `${r.option} ${r.requested}→${r.resolved ?? "none"}`).join(", ")}`
        : c.violations.map((v) => `${v.rule}: wanted ${v.expected}, got ${v.actual}`).join("; ") || undefined;
    return { id: p.channel3Id, title: p.title, price: c?.product.price ?? p.price, ok: Boolean(c?.ok), ...(why ? { why } : {}) };
  });

  // Verifiability is decided in code, not left to the model: if any candidate is confirmed in the exact
  // size/color, only those go to the AI; listings that can't prove the variant are a last resort.
  const unproven = (c: Candidate) => c.match.unverifiable.length * 2 + c.match.approximate.length;
  const ok = evaluated.filter((c): c is Candidate => Boolean(c?.ok));
  if (!ok.length) throw new NoCompliantProduct(considered);
  const bestTier = Math.min(...ok.map(unproven));
  const passing = ok.filter((c) => unproven(c) === bestTier).slice(0, PICK_LIMIT);

  const pick = await choose(mandate, passing);
  const chosen = passing[pick.index];
  return {
    chosen,
    reasoning: pick.reasoning,
    confidence: pick.confidence,
    // What Undo itself couldn't confirm is authoritative; the model's own caveats are kept only for those gaps.
    unverified: chosen.match.unverifiable.length || chosen.match.approximate.length
      ? [...new Set([...chosen.match.unverifiable, ...chosen.match.approximate.map((a) => a.attribute), ...pick.unverified])]
      : [],
    guard: { bypassed: false, violations: [], relaxed: [] },
    considered,
    searches,
    model: pick.model,
  };
}
