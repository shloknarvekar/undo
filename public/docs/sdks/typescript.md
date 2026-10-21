# TypeScript SDK (/docs/sdks/typescript)

[Download SDK](/docs/__downloads/sdk/typescript.zip)

## Intro [#intro]

The Undo API SDK provides access to the Undo API REST APIs.

Ctrl+Z for AI agent purchases, built on PayPal.

Undo sits between a shopping agent and PayPal. A shopper signs a mandate (what the agent may buy, for how much)
with a key that never leaves their device. The agent shops inside it, PayPal only **authorizes** the money, and
an undo window opens. Pressing Undo runs a fault check and routes the money: a free void inside the window, or a
refund, a merchant claim or a return after capture. When the agent was at fault, its operator pays the merchant
back through PayPal Payouts. Every step is written to a hash-chained event log anyone can verify.

**Signing.** Mandates and undo requests are signed with Ed25519 by the shopper's device key. The API never
signs for a shopper. The exact strings to sign are given with each operation.

**Sandbox.** This deployment runs on the PayPal sandbox; no real money moves. Costly endpoints are rate limited
per visitor and answer `429` with a `Retry-After` header when the limit or the free-tier budget is reached.

**Agents.** Third-party agents usually connect over MCP (Streamable HTTP at `/api/mcp`, JSON-RPC, not described
here). This document covers the HTTP API that the web app, agents and merchants call directly.

## Installation [#installation]

The SDK compiles to `dist/` before it can be referenced — run its `build` script once in the SDK folder, then add it to your project by path:

```bash
npm install <path-to-sdk>
```

## Quick Start [#quick-start]

Create one client and reuse it. Configure its behaviour through `ClientOptions`.

```ts
import { UndoApiClient } from "undo-api";

const client = new UndoApiClient({});
```

Nothing in `ClientOptions` is required — `new UndoApiClient()` compiles — and each option left out falls back to its default. This API declares one environment, so there is no environment to select and no host to state at the construction site.

### From CommonJS [#from-commonjs]

The package ships both dialects from a single entry, so `require` works with full types. In a TypeScript CommonJS file use the `import ... = require(...)` form — a plain destructuring `require` runs fine but gives you `any`.

```ts
import sdk = require("undo-api");

const client = new sdk.UndoApiClient({});
```