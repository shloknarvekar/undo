# C# SDK (/docs/sdks/csharp)

[Download SDK](/docs/__downloads/sdk/csharp.zip)

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

Add the SDK as a project reference into your solution:

```bash
dotnet add reference <path-to-sdk>/src/UndoApi/UndoApi.csproj
```

The project takes its build settings from the files around it, so reference it in place.

## Quick Start [#quick-start]

### Dependency Injection [#dependency-injection]

Register the client with `IServiceCollection` and resolve it from the container. The `HttpClient` is managed by `IHttpClientFactory`. Configure the client's behavior through `UndoApiClientOptions`.

```csharp
services.AddUndoApiClient(options =>
{
    options.Environment = ServerEnvironment.Production;
    // TODO: configure more client options here
});
```

### Direct Instantiation [#direct-instantiation]

Create the client by passing an `HttpClient` you manage yourself. Configure the client's behavior through `UndoApiClientOptions`.

```csharp
var httpClient = new HttpClient();
// TODO: configure more client options here
var options = new UndoApiClientOptions { Environment = ServerEnvironment.Production };
var client = new UndoApiClient(httpClient, options);
```