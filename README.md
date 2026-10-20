# Undo — Ctrl+Z for AI agent purchases

> AI agents can already buy things for us. Undo is how they take it back.

Undo is a reversal layer for agentic commerce, built on PayPal. A shopper's request becomes an **Ed25519-signed
mandate** that says exactly what an agent may buy. The agent shops real products, but Undo checks every cart
against the mandate before PayPal sees it, and PayPal only **authorizes** the payment, so the money is held, not
taken. Each purchase gets a risk-based undo window. When something goes wrong, a fault engine decides whose
mistake it was and moves the money through the matching PayPal rail: a void, a refund, a merchant claim with an
evidence pack, or a return. When the agent was at fault, the **agent operator pays the merchant back through
PayPal Payouts**.

Built for the [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/). Everything runs on the PayPal
**sandbox**: no real money moves.

| | |
|---|---|
| **Live app** | https://undo-1c56.onrender.com |
| Shopper demo | [`/shop`](https://undo-1c56.onrender.com/shop) |
| Rogue agents | [`/rogue`](https://undo-1c56.onrender.com/rogue): nine agents attack one signed mandate, live, one of them a real AI hijacked by a prompt injection |
| Merchant console | [`/merchant`](https://undo-1c56.onrender.com/merchant) |
| MCP server | `https://undo-1c56.onrender.com/api/mcp` |
| Health | [`/api/health?deep=1`](https://undo-1c56.onrender.com/api/health?deep=1) |

The app runs on Render's free plan. After a while without visitors it sleeps; the first request then takes
30–60 seconds while it wakes up.

---

## Try it (5 minutes)

0. **No PayPal login? Open a finished case.** One real sandbox order per outcome, each with its full event chain:
   [void](https://undo-1c56.onrender.com/orders/0ea67cb5-229a-49fc-b5d6-92a62bfba1dd) ·
   [refund + operator payout](https://undo-1c56.onrender.com/orders/edd288bc-42d0-41d3-9b87-14915f3ff2c6) ·
   [merchant claim](https://undo-1c56.onrender.com/orders/42f33fa9-072d-49fc-9012-75d9a886576d) ·
   [return](https://undo-1c56.onrender.com/orders/265e5167-e26f-435a-82e2-9e19b51df39f).
   On any order page, *Verify in my browser* re-checks every hash link and the shopper's Ed25519 signatures with your
   browser's own WebCrypto, and *Now try to cheat* edits a local copy (an amount, the verdict, the signed budget, a
   deleted step) to show exactly where the check catches it. The raw evidence is one click to download.
1. **Watch the guard work.** Open [`/rogue`](https://undo-1c56.onrender.com/rogue) and press *Let the agents
   loose*. Eight agents try to break one signed mandate (over budget, wrong size, wrong colour, wrong quantity, an
   edited budget, an expired mandate, a stolen mandate, and a real Gemini agent hijacked by an instruction hidden in a
   product listing). Each is stopped by a named rule; the hijack needs no special detector, because the cart still
   has to fit what the shopper signed. The honest agent gets through.
2. **Buy something with an agent.** On [`/shop`](https://undo-1c56.onrender.com/shop), type *"A black hoodie,
   size M, under $80"*, sign the mandate (your browser makes a device key), and let the agent shop. Approve the
   payment with a **PayPal sandbox personal account**. You land on the order page with the undo countdown running.
   Tick *"Demo: use a careless agent"* first to see an agent-fault purchase.
3. **Undo it.** Press *Undo this purchase*, give a reason, and sign. For a wrong item, *Use my phone's camera* shows
   a one-time QR code: scan it, snap what arrived, and the photo appears on your computer by itself. The phone only
   hands over the photo; your computer's key still signs the undo, over the photo's hash. Open any step in the order's event chain to see
   how it was decided: which checks were rules, which were AI, and the exact PayPal API call and id behind each
   money movement.
4. **Let the agent pay by itself.** On the mandate screen, tick *Let the agent pay without asking me* and save your
   sandbox PayPal wallet once (PayPal Vault). The choice is signed into the mandate, the agent then pays with no
   redirect, the money is still only held, and the undo window gets two extra hours. *Forget it* deletes the wallet
   at PayPal.
5. **See the merchant side.** [`/merchant`](https://undo-1c56.onrender.com/merchant) lists every agent order with
   its verdict, who pays, and any payout from an agent operator, built on AG Grid Community: changed cells flash on
   each refresh, a pinned row totals whatever the filters leave on screen, every column has a typed filter, the layout
   is remembered, and *Export CSV* downloads what you see. *Live activity* streams every step from the event log into
   a second grid as row transactions, with a pause control. *Undo windows* is a Bryntum Scheduler timeline: a row per
   agent, a bar per order running from purchase to the moment its undo window closes, and a line for now, so the
   purchases a shopper can still undo are the bars crossing it. Click a bar to open the order. Under it, *Agent trust* scores every agent from its
   record (clean purchases, faults, refused carts, skipped checks, every point shown), and the store's rules act on
   it at checkout: block agents below a score, give low-trust agents a longer undo window, or accept only registered
   operators. Change a rule and the next checkout follows it, for Undo's agent and every MCP agent.
6. **Use your own agent.** Connect Claude (or any MCP client) to the MCP server below and ask it to buy something.

---

## How the money moves

| What happened | Verdict | PayPal rail | API |
|---|---|---|---|
| Undo inside the window (any reason) | n/a | **Void** the authorization: nothing moved, no fees | `POST /v2/payments/authorizations/{id}/void` |
| Agent broke the mandate, after capture | `AGENT_FAULT` | **Full refund** to the shopper, then the **agent operator pays the merchant back** | `POST /v2/payments/captures/{id}/refund`, `POST /v1/payments/payouts` |
| Merchant shipped the wrong item | `MERCHANT_FAULT` | **Claim** with a signed evidence pack; refund when the merchant accepts | `POST /v2/payments/captures/{id}/refund` |
| Purchase matched the mandate | `SHOPPER_CHANGED_MIND` | **Return**, then a partial refund minus a 15% restocking fee | `POST /v2/payments/captures/{id}/refund` (partial) |
| Not confident | `INCONCLUSIVE` | **Human review**; no money moves automatically | n/a |

Checkout is created with `intent: AUTHORIZE` (`POST /v2/checkout/orders`, then `.../authorize` on return). When
the undo window closes, Undo captures (`POST /v2/payments/authorizations/{id}/capture`). Every money-moving call
carries a deterministic `PayPal-Request-Id`, so retries can't move money twice.

### How a verdict is reached

Rules first, AI second, a person when it's close.

1. **Deterministic checks** compare the signed mandate with what was actually bought: price, quantity, size,
   colour, brand, expiry, and whether the agent skipped Undo's pre-purchase guard.
2. **AI judgment** (Gemini) only looks at what rules can't settle: is the shopper's complaint about the agent's
   choice, and does a photo of the delivered item match the order?
3. Below a 0.7 confidence threshold, the case goes to **human review** instead of moving money.

Every step is appended to a **hash-chained event log**, so editing history breaks the chain, and the order page
shows the chain with a per-step proof view.

---

## Architecture

```mermaid
flowchart LR
  S["Shopper's device<br/>Ed25519 key in IndexedDB"] -- "signs mandate & undo requests" --> U
  W["Undo's web agent"] --> U
  X["Any agent over MCP<br/>(Claude, Cursor, ...)"] -- "/api/mcp" --> U
  U["Undo<br/>Next.js on Render"] -- "search, fresh product detail" --> C["Channel3 catalog"]
  U -- "guard passes → Orders v2 AUTHORIZE" --> P["PayPal sandbox"]
  U -- "void · capture · refund · payouts" --> P
  P -- "signed webhooks" --> U
  U -- "mandates, orders, hash-chained events" --> D[("Neon Postgres")]
  U -- "intent & photo checks" --> G["Gemini"]
  M["Merchant console<br/>AG Grid"] --> U
```

Key decisions:

- **The agent never holds the shopper's key.** Mandates and undo requests are signed in the shopper's browser with
  a non-extractable WebCrypto Ed25519 key. The server re-verifies the signature on every load, so a mandate edited
  in the database is treated as gone.
- **A mandate names the agent it authorizes**, inside the signed bytes. A mandate signed for a registered agent
  can't be used by anyone else, and liability is billed under that name.
- **The guard runs before PayPal.** Products are re-fetched live in the exact variant, and carts that break the
  mandate never become a checkout.
- **The undo window is set by risk.** Minutes for a sure purchase; hours when a size or colour couldn't be verified
  from the listing or the agent was unsure.
- **No cron needed on a free host.** Window captures and payout status checks run opportunistically on traffic
  (`maybeSweep`), and `POST /api/cron/capture-due` is there for an external pinger.

---

## MCP server: let any agent shop under a mandate

`https://undo-1c56.onrender.com/api/mcp` serves the Model Context Protocol over Streamable HTTP.

| Tool | What it does |
|---|---|
| `undo_request_mandate` | Turns the shopper's words into a draft mandate and returns a signing link. The shopper signs on their own device. |
| `undo_get_mandate` | Signed yet? Once signed, returns the mandate id and its exact limits. |
| `undo_search_products` | Searches real retailers with the mandate's price, colour, category and gender limits applied. |
| `undo_check_cart` | Dry run: would this product and variant pass Undo's guard, and how long would the undo window be? |
| `undo_propose_cart` | Runs the guard. Passing carts get an authorize-only PayPal checkout link; failing carts are refused with reasons. |
| `undo_get_order` | Status, undo window, verdict, and the shopper's order page. |

Agents can't sign, undo or capture: only the shopper's device can.

Connect from Claude Code:

```bash
claude mcp add --transport http undo https://undo-1c56.onrender.com/api/mcp
```

On claude.ai or Claude Desktop, add a custom connector with the same URL. Agents without a key are recorded as
*unregistered*. Operators listed in `UNDO_OPERATOR_KEYS` connect with `Authorization: Bearer <key>` and become
*registered*, and mandates signed for them can only be used with that key.

---

## Tech stack

| Layer | Tool |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Payments | PayPal REST sandbox: Orders v2, Payments v2 (authorize, capture, void, refund), Payouts v1, Webhooks (signature verification) |
| Products | [Channel3](https://trychannel3.com) catalog via `@channel3/sdk` |
| AI in the product | Gemini (`gemini-flash-lite-latest`) through the Vercel AI SDK: request parsing, agent ranking, fault checks |
| Agent protocol | MCP server via `mcp-handler` + `@modelcontextprotocol/server` |
| Data | Neon Postgres (serverless driver) + Drizzle ORM |
| Merchant console | AG Grid Community, Bryntum Scheduler (undo-window timeline) |
| Motion | CSS scroll timelines, `framer-motion` |
| Hosting | Render (free web service, Blueprint in `render.yaml`) |

Everything above runs on free plans or free tiers, except Bryntum Scheduler, which runs on its free trial package.

---

## Run it locally

Needs Node 20+ and free accounts for PayPal Developer (sandbox), Channel3, Neon and Google AI Studio.

```bash
git clone https://github.com/shloknarvekar/undo.git
cd undo
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Where it comes from |
|---|---|
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | developer.paypal.com → Apps & Credentials (Sandbox), an app on a **US** sandbox business account (the store) |
| `PAYPAL_OPERATOR_CLIENT_ID`, `PAYPAL_OPERATOR_CLIENT_SECRET` | Optional. A second US sandbox business account and app (the agent operator), with Payouts enabled |
| `CHANNEL3_API_KEY` | trychannel3.com dashboard |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Neon project (`neon env pull` writes both) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | aistudio.google.com/apikey |
| `PAYPAL_WEBHOOK_ID` | Optional. Otherwise looked up from the app's registered webhooks |
| `UNDO_OPERATOR_KEYS`, `CRON_SECRET`, `APP_URL`, `GEMINI_MODEL` | Optional, see `.env.example` |

Then:

```bash
npm run db:migrate   # creates the tables in Neon
npm run dev          # http://localhost:3000
npm test             # 22 unit tests: mandates, signatures, hash chain, guard, fault engine, proof view
```

To approve payments you need a **US sandbox personal account** (Testing Tools → Sandbox Accounts).

### Sandbox spikes

Each script drives one integration end to end against the sandbox:

| Script | What it proves |
|---|---|
| `npm run spike:paypal` | Authorize → void, and authorize → capture → refund |
| `npm run spike:channel3` | Channel3 search and product detail |
| `npm run spike:webhooks` | Webhook registration and signature verification |
| `npm run spike:disputes` | Driving a sandbox dispute from the merchant side |
| `npm run spike:dispute-create` | Opening a dispute through the API (blocked for this app, see below) |
| `npm run spike:mandate` | Signing and verifying mandates against a running server |
| `npm run spike:agent` | The shopping agent end to end |
| `npm run spike:undo -- --base=<url>` | All four Undo scenarios with real sandbox money |
| `npm run spike:mcp -- request` / `shop` | The MCP server, driven like an outside agent |
| `npm run spike:payouts -- check` / `settle` | Agent-operator credentials and a real liability payout |

---

## Project structure

```
src/
  app/                 pages (/, /shop, /orders/[id], /merchant, /rogue, /mandates/sign/[id]) and API routes
  components/          shopper app, order page, merchant console, signing page, rogue agents, UI kit
  lib/
    mandate.ts         intent mandates: prepare, sign message, verify, cart checks, agent binding
    agent.ts           shopping agent and the guard (live re-fetch, variant matching, checks)
    fault.ts, fault-core.ts   fault engine: evidence, verdict, money routing
    money.ts           PayPal money movements, window scheduler, liability payouts
    checkout.ts        the one path that opens a PayPal AUTHORIZE checkout
    paypal.ts          PayPal REST client (merchant and operator accounts)
    proof.ts           per-step proof view derived from the event chain
    rogue.ts           the rogue-agents demo, on the real guard
    crypto.ts, events.ts      Ed25519, canonical JSON, hash-chained event log
  db/                  Drizzle schema and client
drizzle/               SQL migrations
scripts/               sandbox spikes and the migration runner
tests/                 unit tests (node:test)
```

---

## Limitations, honestly

The full threat model, every way agent purchases can go wrong and exactly what in Undo stops each one (with links to
watch it happen), is at [`/security`](https://undo-1c56.onrender.com/security). The short version of what it doesn't cover:

- **Sandbox only.** PayPal sandbox accounts, a demo store, and no real money.
- **PayPal disputes aren't opened through the API.** Creating a dispute as the buyer needs a partner permission this
  app doesn't have (`spike:dispute-create` records the error). The merchant-fault path opens Undo's own claim with
  a signed evidence pack and refunds through the Payments API when the merchant accepts. Disputes opened in
  PayPal's Resolution Center accepted Undo's evidence via `provide-supporting-info`.
- **The careless agent is simulated.** It picks a wrong variant on purpose so the agent-fault path can be shown.
- **One agent-operator account.** In the demo, every agent operator settles from the same sandbox account. Each
  payout still records which agent it was for.
- **Not every listing exposes every variant.** When the catalog can't confirm a size or colour, Undo says so and
  lengthens the undo window rather than guessing.
- **Free-tier limits.** Gemini and Channel3 run on free tiers, so each visitor gets a few tries a minute, and the
  whole demo has daily and monthly budgets stored in Postgres (`src/lib/usage.ts`). Identical catalog searches are
  reused for ten minutes, and the rogue-agents run is shared for five. If a budget runs out, the page says so in
  plain words and the rogue demo replays its last live run; the finished cases always work.
- **Merchant actions aren't behind sign-in** (accepting a claim, marking a return received). They're sandbox-only.

---

## AI inside the product

- **Google Gemini** (`gemini-flash-lite-latest`, free tier, via the Vercel AI SDK) turns the shopper's words into a
  draft mandate, ranks products that already passed the guard, and checks complaints and delivery photos when the
  rules can't decide.

**Components adapted from:** [Aceternity UI](https://ui.aceternity.com) (background boxes, container scroll).

---

## License

[MIT](LICENSE)
