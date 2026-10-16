import { NextResponse } from "next/server";
import { Channel3Error, getProduct, relaxedOptions, toStoreProduct } from "@/lib/channel3";

/**
 * GET /api/products/:id?option_Size=10&option_Color=Black
 * Fresh product detail (free Channel3 call) resolved to the requested variant. `relaxed` lists any
 * option the catalog could not honor — the same evidence the fault engine uses.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requested: Record<string, string> = {};
  for (const [key, value] of new URL(req.url).searchParams) {
    if (key.startsWith("option_") && value) requested[key.slice("option_".length)] = value;
  }

  try {
    const detail = await getProduct(id, Object.keys(requested).length ? requested : undefined);
    const product = toStoreProduct(detail);
    if (!product) return NextResponse.json({ error: "no_offer" }, { status: 404 });
    return NextResponse.json({ product, relaxed: relaxedOptions(requested, detail) });
  } catch (err) {
    if (err instanceof Channel3Error) {
      const status = err.statusCode === 404 ? 404 : 502;
      return NextResponse.json({ error: "channel3_error", status: err.statusCode }, { status });
    }
    throw err;
  }
}
