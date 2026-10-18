import { createHash, timingSafeEqual } from "node:crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { evaluateProduct, searchWithinMandate } from "@/lib/agent";
import { undoWindow } from "@/lib/agent-core";
import { CheckoutFailed, openCheckout, openOrderFor } from "@/lib/checkout";
import { appendEvent } from "@/lib/events";
import type { AgentRef, IntentMandate } from "@/lib/mandate";
import { parseRequest } from "@/lib/mandate-parser";
import { createMandateRequest, loadMandate, loadMandateRequest, loadOrder, publicBaseUrl } from "@/lib/store";

/**
 * Undo as an MCP server: any agent (Claude, ChatGPT, Cursor, your own) can shop under a mandate the shopper signed.
 *
 * The agent never holds the shopper's key. It asks for a mandate and gets a link; the shopper signs on their own
 * device; the agent can then search and propose carts, and Undo's guard decides whether a cart may become a PayPal
 * checkout. Money is only ever authorized (held), and the shopper keeps the Undo button.
 *
 * Agent identity: a bearer key listed in UNDO_OPERATOR_KEYS ("Name:key,Name:key") makes the agent "verified" under
 * that operator name; without one it is recorded under the name it gives, marked unverified.
 */

const sha = (s: string) => createHash("sha256").update(s).digest();
function operatorForKey(token: string): string | null {
  for (const entry of (process.env.UNDO_OPERATOR_KEYS ?? "").split(",")) {
    const i = entry.indexOf(":");
    if (i < 1) continue;
    if (timingSafeEqual(sha(entry.slice(i + 1).trim()), sha(token))) return entry.slice(0, i).trim();
  }
  return null;
}

function callerAgent(auth: AuthInfo | undefined, claimedName?: string): AgentRef {
  if (auth?.clientId) return { name: auth.clientId, verified: true };
  return { name: (claimedName?.trim() || "Unregistered agent").slice(0, 80), verified: false };
}

const text = (summary: string, data: unknown) => ({
  content: [{ type: "text" as const, text: `${summary}\n\n${JSON.stringify(data, null, 2)}` }],
});
const fail = (summary: string, data: unknown = {}) => ({ ...text(summary, data), isError: true });

function baseUrl(req?: Request) {
  return req ? publicBaseUrl(req) : (process.env.APP_URL ?? process.env.RENDER_EXTERNAL_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Loads a mandate an outside agent may act on, or explains why it can't. */
async function mandateFor(mandateId: string, caller: AgentRef): Promise<{ mandate: IntentMandate } | { error: string }> {
  const loaded = await loadMandate(mandateId);
  if (!loaded) return { error: "No signed mandate with that id (or its signature no longer verifies)." };
  if (loaded.status !== "ACTIVE") return { error: `This mandate is ${loaded.status.toLowerCase()}.` };
  const named = loaded.mandate.agent;
  if (!named) return { error: "This mandate was signed for Undo's own web agent, not for outside agents." };
  if (named.verified && (!caller.verified || caller.name !== named.name)) {
    return { error: `This mandate authorizes ${named.name} only. Connect with that operator's key.` };
  }
  return { mandate: loaded.mandate };
}

const limits = (m: IntentMandate) => ({
  item: m.intent.item,
  maxPricePerItem: `${m.intent.maxPrice} ${m.intent.currency}`,
  quantity: m.intent.quantity,
  required: m.intent.attributes,
  ...(m.intent.brands?.length ? { brands: m.intent.brands } : {}),
  ...(m.intent.gender ? { gender: m.intent.gender } : {}),
  expiresAt: m.expiresAt,
});

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "undo_request_mandate",
      {
        title: "Ask the shopper for a signed mandate",
        description:
          "Start here. Turns the shopper's request (in their own words) into a draft mandate and returns a signing link. " +
          "You MUST show the shopper the full link in your reply: they open it, review the limits and sign on their own device. " +
          "You cannot sign for them. When they say they've signed, call undo_get_mandate.",
        inputSchema: z.object({
          request: z.string().min(3).max(1000).describe("What the shopper wants, verbatim, e.g. 'black running shoes, size 10, under $120'"),
          agent_name: z.string().max(80).optional().describe("Your name as the shopper should see it, e.g. 'Claude'"),
        }),
      },
      async ({ request, agent_name }, ctx) => {
        const agent = callerAgent(ctx.http?.authInfo, agent_name);
        let draft;
        try {
          draft = await parseRequest(request);
        } catch {
          return fail("Undo couldn't read that request right now. Try again in a moment.");
        }
        const { id, expiresAt } = await createMandateRequest(request, draft, agent);
        const signUrl = `${baseUrl(ctx.http?.req)}/mandates/sign/${id}`;
        return text(
          `SHOW THE SHOPPER THIS LINK NOW (they must open it and sign before you can search or buy):\n${signUrl}\n\n` +
            (draft.mustAsk.length ? `The page will ask them: ${draft.mustAsk.join(" ")}\n` : "") +
            "Tell them to sign on the phone or laptop they'll keep using: the Undo button only works from the device that signs. " +
            "The first load can take up to a minute while the server wakes up.",
          { mandateRequestId: id, signUrl, expiresAt, requestedBy: agent, draft: { item: draft.item, maxPrice: draft.maxPrice, attributes: draft.attributes, openQuestions: draft.mustAsk } },
        );
      },
    );

    server.registerTool(
      "undo_get_mandate",
      {
        title: "Check whether the shopper has signed",
        description: "Returns the mandate's status. Once signed, returns the mandateId and the exact limits you must shop within.",
        inputSchema: z.object({ mandate_request_id: z.string().uuid() }),
        annotations: { readOnlyHint: true },
      },
      async ({ mandate_request_id }, ctx) => {
        const req = await loadMandateRequest(mandate_request_id);
        if (!req) return fail("No mandate request with that id.");
        if (req.status !== "SIGNED" || !req.mandateId) {
          if (req.status === "EXPIRED") return text("The request expired before the shopper signed. Call undo_request_mandate again.", { status: req.status });
          const signUrl = `${baseUrl(ctx.http?.req)}/mandates/sign/${req.id}`;
          return text(`Not signed yet. Show the shopper this link again and ask them to press the sign button and wait for "Signed.":\n${signUrl}`, {
            status: req.status,
            signUrl,
            openQuestions: req.draft.mustAsk,
            expiresAt: req.expiresAt,
          });
        }
        const loaded = await loadMandate(req.mandateId);
        if (!loaded) return fail("The signed mandate no longer verifies.");
        return text("Signed. Shop only within these limits; Undo re-checks every cart against them.", {
          status: loaded.status,
          mandateId: req.mandateId,
          authorizes: loaded.mandate.agent,
          limits: limits(loaded.mandate),
        });
      },
    );

    server.registerTool(
      "undo_search_products",
      {
        title: "Search products within the mandate",
        description:
          "Searches real retailers (via Channel3) with the mandate's hard limits applied: price ceiling, colour, category, gender. " +
          "You may phrase your own query; you can't widen the limits. Returns product ids and the variants each listing names (unconfirmed until undo_check_cart).",
        inputSchema: z.object({
          mandate_id: z.string().uuid(),
          query: z.string().max(200).optional().describe("Optional search phrase; defaults to the mandate's item and colour"),
          limit: z.number().int().min(1).max(10).default(6),
        }),
        annotations: { readOnlyHint: true },
      },
      async ({ mandate_id, query, limit }, ctx) => {
        const m = await mandateFor(mandate_id, callerAgent(ctx.http?.authInfo));
        if ("error" in m) return fail(m.error);
        const products = await searchWithinMandate(m.mandate, query, limit);
        if (!products.length) return text("Nothing in stock fits the mandate's limits for that search.", { results: [] });
        return text(`${products.length} products within the mandate's limits. Pick one, then call undo_check_cart or undo_propose_cart.`, {
          results: products.map((p) => ({
            productId: p.channel3Id,
            title: p.title,
            brand: p.brand,
            price: p.price,
            currency: p.currency,
            retailer: p.sourceDomain,
            variantsListed: Object.fromEntries(p.variantOptions.map((o) => [o.name, o.values.slice(0, 20)])),
          })),
          note:
            "variantsListed comes from the search index and can be stale or incomplete. Don't tell the shopper a size or colour " +
            "is confirmed until undo_check_cart says so: it re-reads the product page and lists anything it couldn't verify.",
        });
      },
    );

    const cartInput = z.object({
      mandate_id: z.string().uuid(),
      product_id: z.string().min(1).max(200),
      options: z
        .record(z.string(), z.string())
        .optional()
        .describe("The exact variant to buy, using the option names from variantsListed, e.g. { \"Size\": \"10\", \"Color\": \"Black\" }"),
    });

    /** Shared by check and propose: Undo's guard on one product, plus the undo window it would get. */
    async function guard(mandate: IntentMandate, productId: string, options: Record<string, string> | undefined, confidence: number) {
      const c = await evaluateProduct(mandate, productId, options);
      if (!c) return null;
      const window = undoWindow({
        price: c.product.price,
        quantity: mandate.intent.quantity,
        confidence,
        approximate: c.match.approximate.length,
        unverifiable: c.match.unverifiable.length,
        relaxed: c.relaxed.length,
        guardBypassed: false,
      });
      return {
        c,
        window,
        report: {
          passes: c.ok,
          product: { productId: c.product.channel3Id, title: c.product.title, price: c.product.price, currency: c.product.currency, variant: c.product.variant, retailer: c.product.sourceDomain },
          violations: c.violations.map((v) => `${v.rule.replace("attribute:", "")}: mandate says ${v.expected}, this is ${v.actual}`),
          substitutions: c.relaxed.map((r) => `${r.option}: asked for ${r.requested}, retailer resolved ${r.resolved ?? "nothing"}`),
          couldNotVerify: c.match.unverifiable,
          undoWindowIfBought: { minutes: window.minutes, why: window.factors },
        },
      };
    }

    server.registerTool(
      "undo_check_cart",
      {
        title: "Dry-run Undo's guard on a product",
        description: "Fetches the product fresh in the variant you name and checks it against the mandate. Nothing is bought.",
        inputSchema: cartInput,
        annotations: { readOnlyHint: true },
      },
      async ({ mandate_id, product_id, options }, ctx) => {
        const m = await mandateFor(mandate_id, callerAgent(ctx.http?.authInfo));
        if ("error" in m) return fail(m.error);
        const g = await guard(m.mandate, product_id, options, 0.7);
        if (!g) return fail("That product can't be fetched, or isn't sold in the variant you named.");
        return text(g.report.passes ? "Passes Undo's guard." : "Would be refused by Undo's guard.", g.report);
      },
    );

    server.registerTool(
      "undo_propose_cart",
      {
        title: "Propose a cart for PayPal checkout",
        description:
          "Undo re-checks the product against the mandate. If it passes, Undo opens a PayPal checkout that only authorizes " +
          "(holds) the money and returns the approval link for the shopper. If it fails, nothing is created and you get the reasons. " +
          "One open purchase per mandate.",
        inputSchema: cartInput.extend({
          reasoning: z.string().min(3).max(400).describe("One or two sentences the shopper will read: why this product"),
          confidence: z.number().min(0).max(1).describe("How sure you are this is what the shopper meant"),
        }),
      },
      async ({ mandate_id, product_id, options, reasoning, confidence }, ctx) => {
        const caller = callerAgent(ctx.http?.authInfo);
        const m = await mandateFor(mandate_id, caller);
        if ("error" in m) return fail(m.error);
        const open = await openOrderFor(mandate_id);
        if (open) return fail("This mandate already has an open purchase.", { orderId: open });

        const g = await guard(m.mandate, product_id, options, confidence);
        if (!g) return fail("That product can't be fetched, or isn't sold in the variant you named.");
        const operator = { ...(m.mandate.agent ?? caller), via: "mcp" };
        if (!g.report.passes) {
          await appendEvent(mandate_id, "AGENT_CART_REJECTED", { operator, product: g.report.product, violations: g.report.violations, substitutions: g.report.substitutions });
          return fail("Refused by Undo's guard: this cart breaks the shopper's mandate. Nothing was charged.", g.report);
        }

        try {
          const { orderId, approveUrl, amount } = await openCheckout({
            mandateId: mandate_id,
            product: g.c.product,
            quantity: m.mandate.intent.quantity,
            agent: {
              reasoning,
              confidence,
              unverified: g.c.match.unverifiable,
              guard: { bypassed: false, violations: [], relaxed: [] },
              requested: g.c.match.requested,
              approximate: g.c.match.approximate,
              considered: [],
              searches: [],
              model: null,
              operator,
            },
            window: g.window,
            baseUrl: baseUrl(ctx.http?.req),
          });
          return text(
            `Cart accepted. Send the shopper this PayPal link to approve: ${approveUrl}\n` +
              `Approving only holds ${amount} ${g.c.product.currency}; the shopper can undo for free for ${g.window.minutes} minutes.`,
            { orderId, approveUrl, amount, currency: g.c.product.currency, undoWindow: g.report.undoWindowIfBought, orderPage: `${baseUrl(ctx.http?.req)}/orders/${orderId}` },
          );
        } catch (err) {
          return fail("PayPal couldn't create the checkout. Try again.", { detail: err instanceof CheckoutFailed ? err.message : undefined });
        }
      },
    );

    server.registerTool(
      "undo_get_order",
      {
        title: "Check an order",
        description: "Where a purchase stands: awaiting approval, held with the undo window open, captured, or undone (with the verdict).",
        inputSchema: z.object({ order_id: z.string().uuid() }),
        annotations: { readOnlyHint: true },
      },
      async ({ order_id }, ctx) => {
        const o = await loadOrder(order_id);
        if (!o) return fail("No order with that id.");
        const r = o.resolution as { decision?: { verdict: string; liability: string | null }; action?: { type: string; reason: string } } | null;
        return text(`Order is ${o.status}.`, {
          status: o.status,
          amount: o.amount,
          currency: o.currency,
          undoWindowEndsAt: o.windowEndsAt,
          ...(r?.decision ? { verdict: r.decision.verdict, liability: r.decision.liability, action: r.action?.type, reason: r.action?.reason } : {}),
          orderPage: `${baseUrl(ctx.http?.req)}/orders/${o.id}`,
          note: "Only the shopper's signing device can press Undo; agents can't undo or capture.",
        });
      },
    );
  },
  { serverInfo: { name: "undo", version: "1.0.0" } },
);

const authed = withMcpAuth(handler, (_req, token) => {
  const name = token ? operatorForKey(token) : null;
  return name ? { token: token!, clientId: name, scopes: [] } : undefined;
}, { required: false });

export { authed as GET, authed as POST };
