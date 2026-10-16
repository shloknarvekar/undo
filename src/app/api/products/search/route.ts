import { NextResponse } from "next/server";
import { z } from "zod";
import {
  Channel3Error,
  colorFilter,
  resolveCategory,
  searchProducts,
  toStoreProduct,
  type StoreProduct,
} from "@/lib/channel3";

/**
 * POST /api/products/search — the shopping agent's (and the UI's) product search.
 * Mandate constraints map to structured Channel3 filters; the API key never leaves the server.
 */
const SearchBody = z.object({
  query: z.string().min(1).max(500),
  maxPrice: z.number().positive().optional(),
  minPrice: z.number().nonnegative().optional(),
  color: z.string().max(30).optional(),
  /** Free-text category ("running shoes"); resolved to a Channel3 slug server-side. */
  category: z.string().max(60).optional(),
  gender: z.enum(["male", "female"]).optional(),
  limit: z.number().int().min(1).max(30).optional(),
  mode: z.enum(["default", "agentic"]).optional(),
});

export async function POST(req: Request) {
  const parsed = SearchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  }
  const { query, maxPrice, minPrice, color, category, gender, limit, mode } = parsed.data;

  try {
    const slug = category ? await resolveCategory(category) : null;
    const results = await searchProducts(query, {
      limit,
      mode,
      filters: {
        ...(maxPrice !== undefined || minPrice !== undefined
          ? { price: { max_price: maxPrice, min_price: minPrice } }
          : {}),
        ...(gender ? { gender } : {}),
        ...(color ? { colors: colorFilter(color) } : {}),
        ...(slug ? { category_ids: [slug] } : {}),
      },
    });
    const products = results.map(toStoreProduct).filter((p): p is StoreProduct => p !== null);
    return NextResponse.json({ category: slug, products });
  } catch (err) {
    if (err instanceof Channel3Error) {
      return NextResponse.json({ error: "channel3_error", status: err.statusCode }, { status: 502 });
    }
    throw err;
  }
}
