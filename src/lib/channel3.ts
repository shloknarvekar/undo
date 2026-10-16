/**
 * Channel3 product catalog, server-side only. The SDK reads CHANNEL3_API_KEY from the environment;
 * never import this from a client component.
 *
 * Caching rule (Channel3 guidance): cache product ids, not product data. Prices, stock, variants and
 * offer URLs change — call getProduct() (free) right before showing a product or checking out.
 */
import { Channel3, Channel3Api, Channel3Error } from "@channel3/sdk";

export { Channel3Error };
export type Product = Channel3Api.Product;
export type SearchFilters = Channel3Api.SearchFilters;

let client: Channel3 | null = null;
function c3(): Channel3 {
  if (!process.env.CHANNEL3_API_KEY) throw new Error("CHANNEL3_API_KEY missing in .env");
  return (client ??= new Channel3());
}

/**
 * Color words from a mandate → sRGB hex for filters.colors (Channel3 filters color by hex, never attributes.color).
 * Values are as colors appear in product photos: pure #000000 matches nothing, real "black" is near-black.
 */
const COLOR_HEX: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f5f5f5",
  grey: "#808080",
  gray: "#808080",
  navy: "#001f3f",
  blue: "#0057b8",
  red: "#c8102e",
  green: "#2e7d32",
  brown: "#6d4c41",
  beige: "#d8c3a5",
  pink: "#f48fb1",
  yellow: "#fdd835",
  orange: "#fb8c00",
  purple: "#6a1b9a",
};

export function colorFilter(color: string | undefined): SearchFilters["colors"] {
  const hex = color ? COLOR_HEX[color.trim().toLowerCase()] : undefined;
  return hex ? { palette: [{ hex }], match: "standard" } : undefined;
}

/**
 * Free-text category ("running shoes") → real Channel3 slug ("athletic-shoes"). Unknown slugs are silently
 * dropped by search, so always resolve through categories.search instead of guessing. Slugs are stable: cache them.
 */
const categoryCache = new Map<string, string | null>();
export async function resolveCategory(term: string): Promise<string | null> {
  const key = term.trim().toLowerCase();
  if (!categoryCache.has(key)) {
    const res = await c3().categories.search({ query: key, limit: 1 });
    categoryCache.set(key, res.categories[0]?.slug ?? null);
  }
  return categoryCache.get(key) ?? null;
}

export async function searchProducts(
  query: string,
  opts: { limit?: number; filters?: SearchFilters; mode?: "default" | "agentic"; userId?: string } = {},
): Promise<Product[]> {
  const page = await c3().products.search(
    {
      query,
      limit: opts.limit ?? 10,
      filters: { availability: ["InStock"], ...opts.filters },
      config: { mode: opts.mode ?? "default" },
    },
    opts.userId ? { headers: { "x-user-id": opts.userId } } : undefined,
  );
  return page.data;
}

/** Fresh product detail with hydrated variant availability. Free call; use before display/checkout. */
export function getProduct(productId: string, selectedOptions?: Record<string, string>): Promise<Product> {
  return c3().products.retrieve({ product_id: productId, selected_options: selectedOptions });
}

/** Variant dimensions the server actually resolved (e.g. { Color: "Navy", Size: "11" }). */
export function selectedVariant(p: Product): Record<string, string> {
  return Object.fromEntries((p.variants?.selected ?? []).map((s) => [s.name, s.label]));
}

/** Options the caller asked for that the server relaxed to something else — evidence for the fault engine. */
export function relaxedOptions(requested: Record<string, string>, p: Product) {
  const effective = selectedVariant(p);
  return Object.entries(requested)
    .filter(([name, label]) => effective[name]?.toLowerCase() !== label.toLowerCase())
    .map(([name, label]) => ({ option: name, requested: label, resolved: effective[name] ?? null }));
}

/** The shape Undo's store works with: one sellable offer per product. */
export type StoreProduct = {
  channel3Id: string;
  title: string;
  brand: string | null;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  sourceUrl: string;
  sourceDomain: string;
  colors: string[];
  attributes: Record<string, string[]>;
  variant: Record<string, string>;
  variantOptions: { name: string; values: string[] }[];
};

export function toStoreProduct(p: Product): StoreProduct | null {
  const offer = p.offers?.find((o) => o.availability !== "OutOfStock") ?? p.offers?.[0];
  if (!offer) return null;
  const image = p.images?.find((i) => i.is_main_image) ?? p.images?.[0];
  return {
    channel3Id: p.id,
    title: p.title,
    brand: p.brands?.[0]?.name ?? null,
    description: p.description ?? null,
    price: offer.price.price,
    currency: offer.price.currency,
    imageUrl: image?.url ?? null,
    sourceUrl: offer.url,
    sourceDomain: offer.domain,
    colors: (p.colors ?? []).map((c) => c.hex),
    attributes: p.structured_attributes ?? {},
    variant: selectedVariant(p),
    variantOptions: (p.variants?.options ?? []).map((o) => ({
      name: o.name,
      values: o.values.filter((v) => v.exists).map((v) => v.label),
    })),
  };
}
