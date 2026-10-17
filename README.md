# Undo — Ctrl+Z for AI agent purchases

> Every company built how AI agents buy. Nobody built how they undo.

Undo turns a shopper's request into a signed intent mandate, lets an AI agent buy real products with
PayPal in **authorize-only** mode, and gives every purchase a risk-based undo window. When the agent gets it
wrong, a fault engine compares mandate → cart → delivered item and routes the money through the right PayPal
rail: void, refund, dispute evidence, or a partial-refund offer.

Built for the [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/). Work in progress.

**Live demo:** https://undo-1c56.onrender.com (health: [`/api/health?deep=1`](https://undo-1c56.onrender.com/api/health?deep=1))

## Stack

| Layer | Tool |
|---|---|
| App | Next.js 16 (App Router) + TypeScript + Tailwind |
| Payments | PayPal REST sandbox: Orders v2, Payments v2 (authorize / void / capture / refund), Catalog, Disputes v1 |
| Products | [Channel3](https://trychannel3.com) product catalog via `@channel3/sdk` |
| Hosting | Render (free web service) |

## Run locally

```bash
npm install
cp .env.example .env   # fill in PayPal sandbox app credentials and a Channel3 API key
npm run dev
```

Sandbox checks:

```bash
npm run spike:paypal      # authorize → void, and authorize → capture → refund
npm run spike:channel3    # Channel3 search → PayPal Catalog import
npm run spike:disputes    # drive a sandbox dispute from the merchant side
```

Use **US** sandbox accounts for the buyer and merchant.

## API

| Route | Purpose |
|---|---|
| `GET /api/health[?deep=1]` | Liveness; `deep` also checks PayPal sandbox reachability |
| `POST /api/products/search` | `{ query, category?, color?, maxPrice?, minPrice?, gender?, limit?, mode? }` → products |
| `GET /api/products/:id?option_Size=M` | Fresh product detail resolved to a variant, plus any options the catalog relaxed |

## License

MIT — see [LICENSE](LICENSE).
