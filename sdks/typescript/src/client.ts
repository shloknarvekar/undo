import type { ClientOptions } from "./client-options.js";
import { buildCoreClientOptions } from "./core/client-options.js";
import { RawClient } from "./core/raw-client.js";
import * as host from "./core/runtime-environment.js";
import * as s from "./core/validation/index.js";
import { MandateRequests } from "./resources/mandate-requests.js";
import { Mandates } from "./resources/mandates.js";
import { Merchant } from "./resources/merchant.js";
import { Orders } from "./resources/orders.js";
import { Products } from "./resources/products.js";
import { Service } from "./resources/service.js";
import { Shopping } from "./resources/shopping.js";
import { buildServers, type Servers } from "./servers.js";

/**
 * Ctrl+Z for AI agent purchases, built on PayPal.
 *
 * Undo sits between a shopping agent and PayPal. A shopper signs a mandate (what the agent may buy,
 * for how much) with a key that never leaves their device. The agent shops inside it, PayPal only
 * **authorizes** the money, and an undo window opens. Pressing Undo runs a fault check and routes
 * the money: a free void inside the window, or a refund, a merchant claim or a return after
 * capture. When the agent was at fault, its operator pays the merchant back through PayPal Payouts.
 * Every step is written to a hash-chained event log anyone can verify.
 *
 * **Signing.** Mandates and undo requests are signed with Ed25519 by the shopper's device key. The
 * API never signs for a shopper. The exact strings to sign are given with each operation.
 *
 * **Sandbox.** This deployment runs on the PayPal sandbox; no real money moves. Costly endpoints
 * are rate limited per visitor and answer `429` with a `Retry-After` header when the limit or the
 * free-tier budget is reached.
 *
 * **Agents.** Third-party agents usually connect over MCP (Streamable HTTP at `/api/mcp`, JSON-RPC,
 * not described here). This document covers the HTTP API that the web app, agents and merchants
 * call directly.
 */
export class UndoApiClient {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  #products?: Products;
  #mandates?: Mandates;
  #mandateRequests?: MandateRequests;
  #shopping?: Shopping;
  #orders?: Orders;
  #merchant?: Merchant;
  #service?: Service;

  constructor(options: ClientOptions = {}) {
    this.#rawClient = new RawClient({
      ...buildCoreClientOptions(options, "UNDO_API_CLIENT_LOG"),
      defaultHeaders: [
        { name: "User-Agent", value: "UndoApiClient/1.0.0 TypeScript", schema: s.string() },
        { name: "X-APIMatic-Lang", value: "TypeScript", schema: s.string() },
        { name: "X-APIMatic-Package-Version", value: "1.0.0", schema: s.string() },
        { name: "X-APIMatic-Gen-Version", value: "4.0.0", schema: s.string() },
        { name: "X-APIMatic-OS", value: host.operatingSystem(), schema: s.optional(s.string()) },
        { name: "X-APIMatic-Runtime", value: host.runtimeDescription(), schema: s.optional(s.string()) },
      ],
      defaultQuery: [],
      defaultPathParams: [],
    });

    this.#servers = buildServers(options);
  }

  /**
   * Live product catalog search and detail, resolved to an exact variant.
   */
  get products(): Products {
    return (this.#products ??= new Products(this.#rawClient, this.#servers));
  }

  /**
   * Drafting, preparing, signing and reading shopper-signed intent mandates.
   */
  get mandates(): Mandates {
    return (this.#mandates ??= new Mandates(this.#rawClient, this.#servers));
  }

  /**
   * The shopper's side of a mandate an outside agent asked for.
   */
  get mandateRequests(): MandateRequests {
    return (this.#mandateRequests ??= new MandateRequests(this.#rawClient, this.#servers));
  }

  /**
   * Let Undo's agent shop inside a mandate and open a PayPal checkout that only authorizes the
   * money.
   */
  get shopping(): Shopping {
    return (this.#shopping ??= new Shopping(this.#rawClient, this.#servers));
  }

  /**
   * Purchases, their undo windows, the Undo button, and the evidence to verify them.
   */
  get orders(): Orders {
    return (this.#orders ??= new Orders(this.#rawClient, this.#servers));
  }

  /**
   * The store's view. Sandbox demo store; merchant sign-in comes with production use.
   */
  get merchant(): Merchant {
    return (this.#merchant ??= new Merchant(this.#rawClient, this.#servers));
  }

  /**
   * Health and deploy checks.
   */
  get service(): Service {
    return (this.#service ??= new Service(this.#rawClient, this.#servers));
  }
}
