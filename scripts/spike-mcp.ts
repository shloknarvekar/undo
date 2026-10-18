/**
 * Drives Undo's MCP server the way an outside agent would, over plain JSON-RPC (Streamable HTTP).
 *
 *   npm run spike:mcp -- request [baseUrl]   → asks for a mandate, prints the link the shopper signs
 *   npm run spike:mcp -- shop                → once signed: search, a cart that breaks the mandate (must be
 *                                              refused), then a compliant cart (must return a PayPal link)
 *
 * State (base URL + ids) is kept in data/mcp-e2e.json between the two steps.
 */
import "dotenv/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const STATE = "data/mcp-e2e.json";
type State = { base: string; mandateRequestId: string; mandateId?: string };

let nextId = 1;
async function rpc(base: string, method: string, params: unknown = {}) {
  const res = await fetch(`${base}/api/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2025-06-18",
      ...(process.env.UNDO_OPERATOR_KEY ? { Authorization: `Bearer ${process.env.UNDO_OPERATOR_KEY}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  });
  const raw = await res.text();
  // Either a JSON body or an SSE stream whose data: line carries the JSON-RPC response.
  const json = raw.trimStart().startsWith("{") ? raw : (raw.split("\n").find((l) => l.startsWith("data:"))?.slice(5) ?? "");
  if (!json) throw new Error(`HTTP ${res.status}: ${raw.slice(0, 300)}`);
  const msg = JSON.parse(json);
  if (msg.error) throw new Error(`${method}: ${JSON.stringify(msg.error)}`);
  return msg.result;
}

async function tool(base: string, name: string, args: Record<string, unknown>) {
  const r = await rpc(base, "tools/call", { name, arguments: args });
  const body = r.content?.[0]?.text ?? "";
  const cut = body.indexOf("\n\n");
  return { isError: Boolean(r.isError), summary: cut > 0 ? body.slice(0, cut) : body, data: cut > 0 ? JSON.parse(body.slice(cut + 2)) : null };
}

async function connect(base: string) {
  const init = await rpc(base, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "undo-spike", version: "1" } });
  console.log(`✔ connected to ${init.serverInfo?.name} ${init.serverInfo?.version}`);
  const { tools } = await rpc(base, "tools/list");
  console.log(`✔ ${tools.length} tools: ${tools.map((t: { name: string }) => t.name).join(", ")}`);
}

async function request(base: string) {
  await connect(base);
  const r = await tool(base, "undo_request_mandate", { request: "A black hoodie, size M, under $80", agent_name: "Spike Agent" });
  if (r.isError) throw new Error(r.summary);
  mkdirSync("data", { recursive: true });
  writeFileSync(STATE, JSON.stringify({ base, mandateRequestId: r.data.mandateRequestId } satisfies State, null, 2));
  console.log(`✔ mandate requested by ${r.data.requestedBy.name} (verified: ${r.data.requestedBy.verified})`);
  console.log(`  open questions: ${r.data.draft.openQuestions.length ? r.data.draft.openQuestions.join(" ") : "none"}`);
  console.log(`\n→ Sign it on your device: ${r.data.signUrl}\n  then run: npm run spike:mcp -- shop`);
}

async function shop() {
  if (!existsSync(STATE)) throw new Error("Run `npm run spike:mcp -- request` first.");
  const s = JSON.parse(readFileSync(STATE, "utf8")) as State;
  await connect(s.base);

  const m = await tool(s.base, "undo_get_mandate", { mandate_request_id: s.mandateRequestId });
  if (!m.data?.mandateId) throw new Error(`Not signed yet: ${m.summary}`);
  console.log(`✔ signed mandate ${m.data.mandateId} authorizes ${m.data.authorizes.name}; limits ${JSON.stringify(m.data.limits.required)} ≤ ${m.data.limits.maxPricePerItem}`);

  const found = await tool(s.base, "undo_search_products", { mandate_id: m.data.mandateId, limit: 6 });
  if (found.isError || !found.data.results.length) throw new Error(`search: ${found.summary}`);
  console.log(`✔ search: ${found.data.results.length} results within limits`);

  // Find a product that offers both the right size and some other size, to try a wrong variant first.
  const want = String(m.data.limits.required.size ?? "M").toLowerCase();
  const pick = found.data.results.find((p: { variantsOffered: Record<string, string[]> }) =>
    Object.entries(p.variantsOffered).some(([k, v]) => /size/i.test(k) && v.some((x) => x.toLowerCase() === want) && v.length > 1),
  );
  if (!pick) throw new Error("No result offers the mandate's size alongside another size; try another request.");
  const sizeKey = Object.keys(pick.variantsOffered).find((k) => /size/i.test(k))!;
  const wrong = pick.variantsOffered[sizeKey].find((x: string) => x.toLowerCase() !== want);
  const right = pick.variantsOffered[sizeKey].find((x: string) => x.toLowerCase() === want);
  console.log(`  using ${pick.title} (${pick.productId}); wrong size ${wrong}, right size ${right}`);

  const bad = await tool(s.base, "undo_propose_cart", {
    mandate_id: m.data.mandateId,
    product_id: pick.productId,
    options: { [sizeKey]: wrong },
    reasoning: "Closest match I found.",
    confidence: 0.9,
  });
  console.log(`${bad.isError ? "✔" : "✖"} wrong size refused: ${bad.summary}`);
  if (bad.data?.violations?.length) console.log(`  violations: ${bad.data.violations.join("; ")}`);
  if (!bad.isError) throw new Error("Undo accepted a cart that breaks the mandate");

  const dry = await tool(s.base, "undo_check_cart", { mandate_id: m.data.mandateId, product_id: pick.productId, options: { [sizeKey]: right } });
  console.log(`✔ check_cart right size: ${dry.summary} window ${dry.data?.undoWindowIfBought?.minutes} min`);
  if (!dry.data?.passes) {
    console.log(`  (not passing: ${[...(dry.data?.violations ?? []), ...(dry.data?.substitutions ?? [])].join("; ")})`);
    return;
  }

  const good = await tool(s.base, "undo_propose_cart", {
    mandate_id: m.data.mandateId,
    product_id: pick.productId,
    options: { [sizeKey]: right },
    reasoning: `A black hoodie in size ${right}, within your budget.`,
    confidence: 0.85,
  });
  if (good.isError) throw new Error(`propose: ${good.summary}`);
  console.log(`✔ cart accepted: order ${good.data.orderId}, ${good.data.amount} ${good.data.currency}, window ${good.data.undoWindow.minutes} min`);
  console.log(`  PayPal approval link: ${good.data.approveUrl}`);

  const o = await tool(s.base, "undo_get_order", { order_id: good.data.orderId });
  console.log(`✔ get_order: ${o.summary} → ${o.data.orderPage}`);
}

const [cmd = "request", base = process.env.UNDO_BASE ?? "http://localhost:3000"] = process.argv.slice(2);
(cmd === "shop" ? shop() : request(base.replace(/\/$/, ""))).catch((err) => {
  console.error(`✖ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
