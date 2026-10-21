# Python SDK (/docs/sdks/python)

[Download SDK](/docs/__downloads/sdk/python.zip)

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

Add the SDK to your project from its folder, with whichever package manager your project uses. Give each tool a path containing a slash, such as `../undo-api` — a bare folder name is looked up on PyPI instead, and resolves to whatever project holds that name there:

```bash
pip install <path-to-sdk>
```

```bash
uv add <path-to-sdk>
```

```bash
poetry add <path-to-sdk>
```

## Quick Start [#quick-start]

### Synchronous client [#synchronous-client]

Construct `UndoApiClient` with keyword arguments, and call `close()` when you are done. Every argument is optional.

```python
from undo_api import UndoApiClient

client = UndoApiClient()

client.close()
```

Alternatively, scope it — `with UndoApiClient(...) as client:` closes the pool on exit.

### Asynchronous client [#asynchronous-client]

`AsyncUndoApiClient` mirrors `UndoApiClient` with **identical method names**, and every endpoint method is a coroutine. It takes the same arguments, with some differences — for example, the transport argument is `custom_async_http_client`.

```python
from asyncio import run

from undo_api import AsyncUndoApiClient

async def main() -> None:
    client = AsyncUndoApiClient()
    await client.aclose()

run(main())
```

Alternatively, scope it — `async with AsyncUndoApiClient(...) as client:` closes the pool on exit.