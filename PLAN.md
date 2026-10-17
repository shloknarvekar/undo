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

## 6. 27-day schedule (Oct 16 → Nov 11 submit)

| Days | Dates | Goal | Done when |
|---|---|---|---|
| 1–2 | Oct 16–17 | Risk spikes (§5), repo, license, Render skeleton, DB schema | auth/void/capture/refund curl scripts pass; deployed URL live |
| 3–5 | Oct 18–20 | Mandate service + signing + event chain; Channel3 → Catalog import | mandate card renders signed; products in sandbox catalog |
| 6–8 | Oct 21–23 | Shopping agent (tools, reasoning trace) + PayPal checkout approval in AUTHORIZE | agent buys a real-catalog item; order authorized |
| 9–10 | Oct 24–25 | Risk-scored undo window + scheduler capture + time-warp | countdown in UI; auto-capture on expiry |
| 11–13 | Oct 26–28 | Fault engine (rules + Claude fuzzy + vision) with test fixtures | 3 canonical scenarios give correct verdicts ≥ 9/10 runs |
| 14–15 | Oct 29–30 | Money router: void / refund / Payouts liability / disputes + evidence | all 4 routes move sandbox money; webhooks sync |
| 16–18 | Oct 31–Nov 2 | Merchant console in AG Grid (orders, verdicts, evidence drawer, KPIs: fees saved, disputes avoided) | console usable end-to-end |
| 19–20 | Nov 3–4 | Shopper app polish, empty/error states, mobile layout | full flow feels like a product |
| 21 | Nov 5 | **Feature freeze.** Judge mode: seeded accounts, reset button, guided tour | a stranger can run the demo in 3 min unaided |
| 22–23 | Nov 6–7 | README, architecture diagram, Postman collection, "Tools used", screenshots | repo self-explanatory |
| 24–25 | Nov 8–9 | Record + edit video (script §7), upload to YouTube public | < 3:00, no copyrighted music |
| 26 | Nov 10 | Devpost write-up, select prize categories, test hosted URL from incognito | form complete |
| 27 | Nov 11 | **Submit.** Nov 12 = buffer only | submitted |

Cut list if behind (in order): WebAuthn passkey → Payouts liability ledger → vision check (keep text-only fuzzy) → make-offer path.

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
