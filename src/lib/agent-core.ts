/**
 * Pure decision logic for the shopping agent and the undo window. No I/O, fully unit-tested.
 */

const norm = (s: string) => s.trim().toLowerCase();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export type VariantOption = { name: string; values: string[] };

export type VariantMatch = {
  /** Option name → label to ask Channel3 for (e.g. { Size: "10", Color: "Core Black" }). */
  requested: Record<string, string>;
  /** Mandate attributes matched only loosely ("black" → "Core Black / White"): plausible, not proven. */
  approximate: { attribute: string; wanted: string; label: string }[];
  /** The product has the option but no label for the wanted value: this product can't satisfy the mandate. */
  missing: { attribute: string; wanted: string }[];
  /** Mandate attributes the product doesn't expose as an option at all: left for the AI and the undo window. */
  unverifiable: string[];
};

/** "10" matches "US 10" or "10 M" but not "10.5" or "110"; "black" matches "Black/Black". */
export function containsToken(label: string, wanted: string): boolean {
  return new RegExp(`(^|[^\\w.])${esc(norm(wanted))}($|[^\\w.])`).test(norm(label));
}

export function matchVariant(attributes: Record<string, string>, options: VariantOption[]): VariantMatch {
  const out: VariantMatch = { requested: {}, approximate: [], missing: [], unverifiable: [] };
  for (const [attribute, wanted] of Object.entries(attributes)) {
    const option = options.find((o) => norm(o.name) === norm(attribute)) ?? options.find((o) => norm(o.name).includes(norm(attribute)));
    // An option the catalog lists with no in-stock labels proves nothing either way: unverifiable, not missing.
    if (!option || option.values.length === 0) {
      out.unverifiable.push(attribute);
      continue;
    }
    const exact = option.values.find((v) => norm(v) === norm(wanted));
    if (exact) {
      out.requested[option.name] = exact;
      continue;
    }
    const loose = option.values.find((v) => containsToken(v, wanted));
    if (loose) {
      out.requested[option.name] = loose;
      out.approximate.push({ attribute, wanted, label: loose });
      continue;
    }
    out.missing.push({ attribute, wanted });
  }
  return out;
}

/**
 * Weaker evidence for attributes the listing has no option for: the value named in the title or the extracted
 * product attributes ("HOODIE IN BLACK"). Moves them from `unverifiable` to `approximate`; never to exact.
 */
export function withTextEvidence(match: VariantMatch, attributes: Record<string, string>, title: string, extracted: Record<string, string[]>): VariantMatch {
  const unverifiable: string[] = [];
  const approximate = [...match.approximate];
  for (const attribute of match.unverifiable) {
    const wanted = attributes[attribute];
    const fromAttrs = Object.entries(extracted).find(([k, vs]) => norm(k) === norm(attribute) && vs.some((v) => containsToken(v, wanted)));
    if (fromAttrs) approximate.push({ attribute, wanted, label: `listing ${fromAttrs[0]}: ${fromAttrs[1].join(", ")}` });
    else if (containsToken(title, wanted)) approximate.push({ attribute, wanted, label: `title: ${title}` });
    else unverifiable.push(attribute);
  }
  return { ...match, approximate, unverifiable };
}

/**
 * For the demo's "unguarded third-party agent": the variant a careless agent grabs instead — the neighbouring
 * label of the first option it was asked to match (size 10 → 10.5). Returns null when there's no alternative.
 */
export function neighbouringVariant(requested: Record<string, string>, options: VariantOption[]): Record<string, string> | null {
  for (const [name, label] of Object.entries(requested)) {
    const values = options.find((o) => o.name === name)?.values ?? [];
    const i = values.indexOf(label);
    const other = values[i + 1] ?? values[i - 1];
    if (i >= 0 && other) return { ...requested, [name]: other };
  }
  return null;
}

export type RiskInput = {
  price: number;
  quantity: number;
  confidence: number;
  approximate: number;
  unverifiable: number;
  relaxed: number;
  guardBypassed: boolean;
};

export type UndoWindow = { minutes: number; factors: { factor: string; minutes: number }[] };

const HOUR = 60;
/** Never hold longer than 48h: PayPal's honor period for an authorization is 3 days. */
export const MAX_WINDOW_MINUTES = 48 * HOUR;

/**
 * How long the money stays authorized-but-not-captured, i.e. how long Undo is a free void instead of a refund.
 * Cheap, certain purchases capture immediately; expensive or uncertain ones get a longer window.
 */
export function undoWindow(r: RiskInput): UndoWindow {
  const total = r.price * r.quantity;
  const factors: UndoWindow["factors"] = [];
  const base = total < 20 ? 0 : total < 100 ? 1 * HOUR : total < 300 ? 6 * HOUR : 24 * HOUR;
  factors.push({ factor: `order total $${total.toFixed(2)}`, minutes: base });
  if (r.approximate) factors.push({ factor: `${r.approximate} attribute(s) matched loosely`, minutes: 3 * HOUR });
  if (r.unverifiable) factors.push({ factor: `${r.unverifiable} attribute(s) not verifiable from listing`, minutes: 6 * HOUR });
  if (r.confidence < 0.7) factors.push({ factor: `agent confidence ${r.confidence.toFixed(2)}`, minutes: 6 * HOUR });
  if (r.relaxed) factors.push({ factor: `catalog substituted ${r.relaxed} requested option(s)`, minutes: 12 * HOUR });
  if (r.guardBypassed) factors.push({ factor: "agent bypassed Undo's pre-purchase check", minutes: 12 * HOUR });
  const minutes = Math.min(MAX_WINDOW_MINUTES, factors.reduce((s, f) => s + f.minutes, 0));
  return { minutes, factors };
}
