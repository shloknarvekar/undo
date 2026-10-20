# Undo — Ctrl+Z for AI agent purchases

> "Every company built how AI agents buy. Nobody built how they undo."

PayPal AI Hackathon · solo · deadline **Nov 13, 2026 01:30 IST** (submit by **Nov 11**, keep 1 day buffer).

---

## 1. Product in one paragraph

A shopper tells an AI agent what to buy. Undo turns that into a **signed intent mandate**, lets the agent shop real products (Channel3) from a PayPal sandbox merchant, and pays with a PayPal order in **AUTHORIZE** mode. Every purchase gets a **risk-based undo window** before capture. If the shopper hits **Undo**, a **fault engine** compares mandate → cart → delivered item and routes money through the right PayPal rail: **void** (inside window, no fees), **refund** (agent fault), **dispute + evidence pack** (merchant fault), or **partial-refund offer / return** (shopper changed mind, merchant protected). Merchants see every agent order, verdict and evidence in an **AG Grid** console.

## 2. Users & surfaces

| Surface | User | Key screens |
|---|---|---|
| **Shopper app** | person delegating shopping to an agent | chat → mandate card (signed) → agent's pick with reasoning → live undo countdown → Undo flow (optional photo upload) → verdict + money movement |
| **Merchant console** | merchant receiving agent orders | AG Grid of agent orders (status, window, risk, verdict, fees saved), evidence-pack drawer, dispute actions, KPIs |
| **Event log ("receipt")** | both + judges | hash-chained timeline of every step with the exact PayPal API call made — shows depth to judges |

## 3. Architecture

```
 Shopper app (Next.js)            Merchant console (Next.js + AG Grid)
        │                                     │
        ▼                                     ▼
 ┌──────────────────────── API (Next.js route handlers, Node) ─────────────────────────┐
 │ Mandate service   Shopping agent      Window/risk scorer   Fault engine   Router     │
 │ (parse + sign)    (AI SDK + tools)    (rules + LLM)        (rules → LLM)  (PayPal)   │
 │                         │                                       │            │       │
 │                 Channel3 search                     Claude vision     PayPal REST:   │
 │                 PayPal Catalog                      (delivered photo)  Orders v2,    │
 │                                                                       Payments v2,  │
 │                    Append-only event store (hash chain, Ed25519 sigs)  Disputes v1,  │
 │                                                                       Webhooks,     │
 │                    Scheduler: capture when window expires             Payouts       │
 └──────────────────────────────────────────────────────────────────────────────────────┘
        │ Postgres (Render)              │ PayPal webhooks (CHECKOUT.*, PAYMENT.*, CUSTOMER.DISPUTE.*)
```

### Components

1. **Mandate service**
   - LLM (structured output, zod) turns "black running shoes, size 10, under $120, by Friday" into an `IntentMandate`:
     `{ category, attributes:{size,color,...}, maxPrice, currency, qty, merchantAllowlist?, deadline, mustAsk:[...] }`
   - Shopper confirms → signed with Ed25519 (per-user key; stretch: WebAuthn passkey).
   - Agent's chosen cart → `CartMandate` (item, price, attributes, merchant, agent reasoning) linked to intent hash.
   - AP2-inspired shape; cite AP2 in README.

2. **Shopping agent**
   - Vercel AI SDK `generateText` with tools: `searchProducts` (Channel3), `getProduct`, `createOrder` (PayPal via Agent Toolkit or direct REST).
   - Products come from Channel3, imported into **your own sandbox merchant** via PayPal Catalog API (real data, sandbox money).
   - Seeded "agent error modes" for demo determinism (e.g. wrong size variant) behind a demo toggle — but the real path works too.

3. **Undo window (risk scorer)**
   - Order created with `intent: AUTHORIZE`; authorization held, not captured.
   - Window length = f(price, category return-rate, agent confidence, mandate ambiguity, first-time merchant). e.g. $12 refill → capture immediately; $400 jacket → 6 h.
   - Scheduler captures on expiry. Demo has a "time warp" control.
   - Stay well inside the 3-day honor period; reauthorize if ever needed.

4. **Fault engine** (deterministic first, LLM only for fuzzy)
   - Rule checks: price ≤ max, qty, size/variant, merchant allowlist, deadline, category.
   - Fuzzy checks (Claude): "is this 'black'?", "is this a running shoe?", delivered-photo vs listing (vision).
   - Output: `AGENT_FAULT | MERCHANT_FAULT | SHOPPER_CHANGED_MIND | INCONCLUSIVE` + confidence + cited evidence. Below threshold → human review queue in merchant console.

5. **Money router** (the PayPal depth judges score)
   | Situation | PayPal call |
   |---|---|
   | Undo inside window (any reason) | `POST /v2/payments/authorizations/{id}/void` — no money moved, no fees |
   | Window passed, AGENT_FAULT | capture refund `POST /v2/payments/captures/{id}/refund`; liability ledger shows the **agent operator** reimbursing the merchant via **Payouts** |
   | MERCHANT_FAULT | Undo claim to merchant; if contested → PayPal dispute; push evidence pack via `provide-evidence`; sandbox `adjudicate` to finish |
   | SHOPPER_CHANGED_MIND | merchant protected: return label + refund minus restock, or `make-offer` partial refund on a dispute |
   - Webhooks keep state in sync; verify webhook signatures (judges are engineers — do it right).
   - Use `PayPal-Request-Id` idempotency on every money call.

6. **Event store**: every step appended with `prevHash`; mandate + cart signed. "Export evidence pack" = PDF/JSON of the chain.

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| App | **Next.js (App Router) + TypeScript**, Tailwind + shadcn/ui | one repo for both surfaces + API |
| AI | **Vercel AI SDK** + **PayPal Agent Toolkit** (supports AI SDK); Claude **Sonnet 5.5** (agent, vision, fault reasoning), **Haiku 5.5** (mandate parsing, cheap checks) | structured outputs, tool calling, vision |
| Products | **Channel3** API / SDK (1,000 free credits/mo) | real catalog → Channel3 prize |
| Payments | PayPal REST sandbox: Orders v2, Payments v2 (auth/capture/void/refund), Catalog, Disputes v1, Payouts, Webhooks; JS SDK buttons for shopper approval | maximum "thorough use of PayPal" |
| Grid | **AG Grid React** (merchant console, master/detail, cell renderers, charts) | AG Grid prize ($5k 1st) |
| DB | **Postgres** (Render) + Drizzle ORM | simple, hosted |
| Crypto | Node `crypto` Ed25519 + SHA-256 chain | tamper-evident mandates |
| Hosting | **Render** (web service + Postgres + cron for window capture) | hosted demo URL + Render prize |
| API docs | Postman collection of Undo's API in repo | judges from Postman; good docs score |
| Repo | public GitHub, **MIT license**, README with "Tools used", setup, judge test accounts | submission requirements |

## 5. Day-1 risk spikes (do these before anything else)

1. **Sandbox auth → void → capture → refund** works end to end with `intent: AUTHORIZE`.
2. **Disputes in sandbox**: buyer-side create-dispute API needs extra scopes from PayPal (account manager). Fallback that is fine: open the dispute as the sandbox personal account in the sandbox Resolution Center, then drive everything else (list, `provide-evidence`, `make-offer`, `adjudicate`) via API. Ask in the hackathon Discord whether scopes can be granted.
   - **Result (Oct 16):** API create is blocked. With `PayPal-Auth-Assertion` → `No permissions to set target_client_id` (partner permission); without it → `INVALID_BUYER_TRANSACTION_ID` (needs the buyer-side txn id). Disputes opened in the Resolution Center work: visible via list/get by buyer *and* seller txn id after a few minutes of sandbox lag, auto-escalated INQUIRY → CHARGEBACK, and `provide-supporting-info` accepted the Undo evidence pack. `adjudicate` was still not offered at last check.
   - **Product framing:** the shopper opens the dispute in PayPal (as in real life); Undo prepares the evidence pack and the merchant console pushes it via the Disputes API. For the demo video, pre-open disputes the day before so they have progressed.
3. **Channel3 key** + import 30 products into PayPal Catalog. ✅ 30/30 via `@channel3/sdk` (category slugs + color hex filters).
4. **Render deploy** of a hello-world Next.js + Postgres. ✅ Free web service at https://undo-1c56.onrender.com. Postgres moves to Neon free (Render's free DB is deleted after 30 days).
5. **Webhook** delivery to Render URL with signature verification. ✅ Webhook `4K746543RE256751T` (9 event types); real `CATALOG.PRODUCT.CREATED` delivered and verified via verify-webhook-signature; forged request rejected with 400.

Spike 1 ✅ (Oct 16): authorize→void and authorize→capture→refund all COMPLETED in sandbox.

If spike 2 fails completely, merchant-fault path becomes "Undo claim" handled inside Undo + refund — still demoable.

## 6. Schedule

### 6a. Done (Oct 16 → Oct 19)

Everything in the original 27-day plan up to "polish" shipped early: PayPal rails (authorize, void, capture, refund),
webhooks, signed mandates and the hash chain, the shopping agent, the risk window and scheduler, the fault engine and
money router, the merchant console, Payouts liability settlement (verified live), the MCP server (verified with real
Claude), the per-step proof view, rogue agents, the README and license.

### 6b. Win plan (Oct 19 → Nov 11 submit)

One feature per slot, each shipped live and verified before the next starts. Gates in **bold**.

| Dates | Work | Done when |
|---|---|---|
| Oct 19 (Mon) | Check Devpost prizes for sponsor categories. Landing page tells the new story (any AI via MCP, operator pays the shop back, rogue agents) | done: sponsor list below; landing shows all three |
| Oct 20 (Tue) | "See finished cases" links (one real order per outcome). Quota protection on `/api/rogue` and mandate drafting; 404 page | done Oct 19: cases linked from landing + README; per-visitor limits + Postgres day/month budgets; 404 page |
| Oct 21 (Wed) | Hijacked agent: a real LLM agent reads a listing with a prompt injection; Undo's guard still blocks the cart | ninth rogue agent fooled live, blocked by a named rule |
| Oct 22 (Thu) | Verify it yourself: re-check the event chain hashes and Ed25519 signatures in the browser, plus a tamper toggle | verification runs with no server call; tamper breaks it |
| Oct 23 (Fri) | **Vault spike (2 h):** can the sandbox vault a PayPal wallet and charge it merchant-initiated? | **GO (Oct 20, early).** `npm run spike:vault`: setup token → buyer approves once → payment token `5w904687lm9466843` → $1.00 AUTHORIZE order with the vault id alone came back COMPLETED (auth `6F256151SD4132020`), voided at once. Needed: "Save payment methods" on the Undo US app, plus a fresh OAuth token (PayPal caches tokens ~9 h; the client now renews on 401). |
| Oct 23–26 (Fri–Mon) | **Done Oct 20.** Autonomous agent payments with PayPal Vault: wallet saved once per device (signed), `payWith: saved_wallet` inside the signed mandate, vault-id AUTHORIZE with no redirect, +2 h undo window; live e2e `npm run spike:autopay` bought, voided and forgot the wallet | agent pays with no redirect; undo still works |
| Oct 27–28 (Tue–Wed) | **Done Oct 20.** Agent trust scores + merchant rules (block or lengthen windows by agent record) | done: block rule refused the careless agent (403), default rule added "+6 h merchant rule" to its window |
| Oct 29 (Thu) | **Done Oct 20.** Phone photo by QR for wrong-item cases; desktop verdict updates live | done: one-time 15-min QR link, phone sends, computer collects once and signs over its hash |
| Oct 30 (Fri) | **Bryntum** (free trial): undo-window timeline in the merchant console, one bar per held order from authorize to window close, voids and captures marked | live orders on the timeline, a void ends its bar |
| Oct 31 (Sat) | OpenAPI spec, Postman collection, SDKs generated with APIMatic | collection runs green against the live app |
| Nov 1 (Sun) | **AG Grid** showcase: live PayPal webhook feed and transactions in AG Grid, cells flash on status change, pinned totals row, CSV export. Threat model page | both live |
| Nov 2 (Mon) | Landing, README and video brief updated for every new feature | docs match the app |
| Nov 3–4 (Tue–Wed) | Full QA: every flow on live, desktop + phone, accessibility pass, all spikes re-run; fix everything found | zero known bugs |
| Nov 5 (Thu) | **Feature freeze.** Record the Claude MCP clip; send the final brief to the video maker | brief sent |
| Nov 6–9 (Fri–Mon) | Video made by the video maker; Nov 8: repo public, keepalive on, check everything from an incognito window | video draft reviewed |
| Nov 10 (Tue) | Devpost write-up, screenshots, prize categories, video uploaded public | form complete |
| Nov 11 (Wed) | **Submit.** Nov 12 and early Nov 13 are buffer only | submitted |

Sponsor prizes in reach (Devpost, checked Oct 19): AG Grid ($5k/$2k/$1k), APIMatic ($1k x3), Bryntum ($1k x3), Channel3 ($1.5k), Render (credits), plus Most Creative, Most Impactful, Best Demo Delivery, Best Use of PayPal + AI, Best Use of Agentic Commerce ($5k each).

Cut list if behind (drop from the top first): threat model page → QR photo → Bryntum timeline → trust scores.
Never cut: landing story, finished cases, quota protection, QA days, freeze date.

## 7. 3-minute demo script

| Time | Screen | Voiceover (approx.) |
|---|---|---|
| 0:00–0:15 | Headline stats over black: 132M US adults have bought with AI; only 24% trust agents; no one owns the mistake | "AI agents are already shopping for us. When they get it wrong, nobody has an undo button." |
| 0:15–0:30 | Title card: **Undo** — Ctrl+Z for agent purchases | "Undo is the reversal layer for agentic commerce, built on PayPal." |
| 0:30–0:55 | Shopper chats: "black running shoes, size 10, under $120". Signed mandate card appears | "Your words become a signed mandate — exactly what the agent is allowed to buy." |
| 0:55–1:15 | Agent searches real products, picks one, PayPal approval, **authorized, not captured**; countdown 6:00:00 | "The agent pays with PayPal, but the money is only authorized. Risk decides how long you can undo." |
| 1:15–1:40 | **Scenario 1 – agent fault, inside window.** Undo → diff in red: size 11 ≠ 10 → verdict AGENT_FAULT → `void` | "Wrong size. Undo checks the mandate, blames the agent, and voids the payment. No money moved, no fees for the merchant." |
| 1:40–2:05 | **Scenario 2 – merchant fault, after capture.** Upload photo of navy shoes → vision: not black → MERCHANT_FAULT → dispute + evidence pack sent via Disputes API | "The merchant shipped the wrong color. Undo builds the evidence pack and files it through PayPal disputes." |
| 2:05–2:25 | **Scenario 3 – changed mind.** Item matches mandate → SHOPPER_CHANGED_MIND → merchant protected, return minus restock | "And when the agent did everything right? The merchant is protected." |
| 2:25–2:45 | Merchant console (AG Grid): agent orders, verdicts, fees saved, event chain with every PayPal call | "Merchants finally see which agent orders go wrong — and why." |
| 2:45–3:00 | Architecture strip (PayPal Orders · Payments · Disputes · Payouts · Webhooks · Claude · Channel3 · AG Grid · Render) + closing line | "Agents will only be trusted when they can be undone. Undo." |

Recording tips: 1080p, scripted voiceover recorded separately, time-warp for countdowns, royalty-free or no music, no third-party logos beyond sponsor tools you used.

## 8. Judging-criteria checklist

- **Tech**: 6+ PayPal APIs used with real money movement, idempotency, verified webhooks, AUTHORIZE flow.
- **Design**: two complete surfaces, empty/error states, mobile shopper view.
- **Impact**: open with 132M / 24% / no dispute code for agent error; merchant fee-savings KPI.
- **Innovation**: post-purchase reversal layer + risk-based undo window — differs from mandate-only projects (AP2, AgentBuyer).
- **Presentation**: three scenarios, three different money rails, under 3 minutes.

## 9. Prepared answers for judges

- *"PayPal Agent Ready already gives buyer protection."* → It covers item-not-received, not-as-described and unauthorized. "My agent misunderstood me" fits none; Undo supplies the evidence and fault attribution that plugs into PayPal disputes.
- *"Isn't the AI judge another source of error?"* → Deterministic rules decide most cases; LLM only for fuzzy attributes, with confidence threshold and human review.
- *"Business model?"* → Per-resolved-case fee for merchants, or agent platforms pay to be "Undo-certified" (liability pool).
