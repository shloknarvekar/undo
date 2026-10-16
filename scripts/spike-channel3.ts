/**
 * Day-1 spike #3: real products from Channel3 → Undo store → PayPal Catalog (sandbox).
 *
 *   1. Search Channel3 for the demo categories (with mandate-style filters: price cap, in stock).
 *   2. Normalize each hit to one sellable offer (StoreProduct).
 *   3. Create a PayPal catalog product per item (idempotent: PayPal-Request-Id = Channel3 id).
 *   4. Write data/catalog.json — the seed for Undo's store (git-ignored).
 *
 * Run: npm run spike:channel3
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import {
  Channel3Error,
  colorFilter,
  getProduct,
  relaxedOptions,
  resolveCategory,
  searchProducts,
  toStoreProduct,
  type SearchFilters,
  type StoreProduct,
} from "../src/lib/channel3";
import { catalog, PayPalError } from "../src/lib/paypal";

// Mandate-style constraints expressed as structured filters (color via filters.colors hex, per Channel3 guidance).
const QUERIES: { query: string; category: string; filters: SearchFilters }[] = [
  { query: "running shoes", category: "running shoes", filters: { price: { max_price: 150 }, gender: "male", colors: colorFilter("black") } },
  { query: "noise cancelling earbuds", category: "wireless earbuds", filters: { price: { max_price: 250 } } },
  { query: "hoodie", category: "hoodie", filters: { price: { max_price: 80 }, colors: colorFilter("black") } },
];
const PER_QUERY = 10;

type CatalogEntry = StoreProduct & { query: string; paypalProductId: string | null };

async function main() {
  console.log("\nUndo · Channel3 → PayPal Catalog spike\n");
  const entries: CatalogEntry[] = [];

  for (const { query, category, filters } of QUERIES) {
    const slug = await resolveCategory(category);
    const results = await searchProducts(query, {
      limit: PER_QUERY,
      filters: { ...filters, ...(slug ? { category_ids: [slug] } : {}) },
    });
    const products = results.map(toStoreProduct).filter((p): p is StoreProduct => p !== null);
    console.log(`  ✔ "${query}" [${slug ?? "no category"}] → ${results.length} results, ${products.length} with a sellable offer`);
    const sample = products[0];
    if (sample) {
      console.log(`      e.g. ${sample.title} · ${sample.brand ?? "?"} · $${sample.price} ${sample.currency} · ${sample.sourceDomain}`);
      console.log(`      variant options: ${JSON.stringify(sample.variantOptions).slice(0, 160)}`);
    }
    for (const p of products) entries.push({ ...p, query, paypalProductId: null });
  }

  // The fault engine's core evidence: ask for a specific variant and see what the catalog actually resolves.
  const shoe = entries.find((e) => e.variantOptions.some((o) => /size/i.test(o.name)));
  if (shoe) {
    const sizeOption = shoe.variantOptions.find((o) => /size/i.test(o.name))!;
    const wanted = { [sizeOption.name]: sizeOption.values.find((v) => v.startsWith("10")) ?? sizeOption.values[0] };
    const detail = await getProduct(shoe.channel3Id, wanted);
    const relaxed = relaxedOptions(wanted, detail);
    console.log(
      `  ✔ Variant resolve: asked ${JSON.stringify(wanted)} → got ${JSON.stringify(toStoreProduct(detail)?.variant)}` +
        (relaxed.length ? `  (relaxed: ${JSON.stringify(relaxed)})` : "  (exact match)"),
    );
  } else {
    console.log("  · No product with a Size option in this batch; skipping variant check");
  }

  let created = 0;
  for (const e of entries) {
    try {
      const product = await catalog.createProduct(
        { name: e.title, description: e.description ?? e.brand ?? undefined, image_url: e.imageUrl ?? undefined, home_url: e.sourceUrl },
        `undo-catalog-${e.channel3Id}`,
      );
      e.paypalProductId = product.id;
      created++;
    } catch (err) {
      const msg = err instanceof PayPalError ? `${err.message} ${JSON.stringify(err.body).slice(0, 200)}` : String(err);
      console.log(`  ✖ catalog create failed for "${e.title.slice(0, 50)}": ${msg}`);
    }
  }
  console.log(`\n  ✔ PayPal Catalog: ${created}/${entries.length} products created`);
  const first = entries.find((e) => e.paypalProductId);
  if (first?.paypalProductId) {
    const check = await catalog.get(first.paypalProductId);
    console.log(`  ✔ Read back ${check.id}: "${check.name.slice(0, 60)}"`);
  }

  await mkdir("data", { recursive: true });
  await writeFile("data/catalog.json", JSON.stringify(entries, null, 2));
  console.log(`  ✔ Wrote data/catalog.json (${entries.length} products)\n`);
}

main().catch((err) => {
  if (err instanceof Channel3Error || err instanceof PayPalError) {
    console.error(`\n✖ ${err.message}\n  ${JSON.stringify(err.body, null, 2)}`);
  } else {
    console.error(`\n✖ ${err instanceof Error ? err.message : err}`);
  }
  process.exit(1);
});
