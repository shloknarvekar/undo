import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { activityFeedSchema, type ActivityFeed } from "../models/activity-feed.js";
import { errorSchema, type Error } from "../models/error.js";
import { merchantAgentsSchema, type MerchantAgents } from "../models/merchant-agents.js";
import { merchantOrdersSchema, type MerchantOrders } from "../models/merchant-orders.js";
import { merchantRulesSchema, type MerchantRules } from "../models/merchant-rules.js";
import { rateLimitedSchema, type RateLimited } from "../models/rate-limited.js";
import { resolveOrderRequestSchema, type ResolveOrderRequest } from "../models/resolve-order-request.js";
import { resolveOrderResultSchema, type ResolveOrderResult } from "../models/resolve-order-result.js";
import type { Servers } from "../servers.js";

/**
 * The store's view. Sandbox demo store; merchant sign-in comes with production use.
 */
export class Merchant {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Get the store's agent rules
   *
   * @remarks
   * The rules the store applies to agents at checkout: block below a trust score, lengthen the undo
   * window below a score, or accept only registered operators.
   *
   * @returns The rules.
   *
   * @throws {@link ApiError} when the API answers with an error status
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getMerchantRules(options?: RequestOptions): ApiPromise<MerchantRules, ApiError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/merchant/rules"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: merchantRulesSchema },
        errorFactory: ApiError,
      },
      options,
    );
  }

  /**
   * Stream the store's activity
   *
   * @remarks
   * Every step Undo records, newest first (up to 60). Pass `after` to get only events newer than
   * that id.
   *
   * @returns Activity events.
   *
   * @throws {@link ApiError} when the API answers with an error status
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  listMerchantActivity(
    request: Merchant.ListMerchantActivityRequest,
    options?: RequestOptions,
  ): ApiPromise<ActivityFeed, ApiError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/merchant/activity"),
        auth: noneAuth,
        pathParams: [],
        query: [{ name: "after", value: request.after, schema: s.optional(s.int()) }],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: activityFeedSchema },
        errorFactory: ApiError,
      },
      options,
    );
  }

  /**
   * List agents and their trust scores
   *
   * @remarks
   * Every agent that has shopped here, its record and trust score with every point explained, and
   * what the store's rules do to it.
   *
   * @returns Agents and the store's rules.
   *
   * @throws {@link ApiError} when the API answers with an error status
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  listMerchantAgents(options?: RequestOptions): ApiPromise<MerchantAgents, ApiError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/merchant/agents"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: merchantAgentsSchema },
        errorFactory: ApiError,
      },
      options,
    );
  }

  /**
   * List agent orders
   *
   * @remarks
   * Every agent order (latest 300) with its verdict, who pays and any agent payout, plus headline
   * numbers.
   *
   * @returns Orders and KPIs.
   *
   * @throws {@link ApiError} when the API answers with an error status
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  listMerchantOrders(options?: RequestOptions): ApiPromise<MerchantOrders, ApiError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/merchant/orders"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: merchantOrdersSchema },
        errorFactory: ApiError,
      },
      options,
    );
  }

  /**
   * Resolve an order as the merchant
   *
   * @remarks
   * The merchant's side of an Undo. Sandbox only.
   *
   * @returns Done; the body describes the PayPal actions taken.
   *
   * @throws {@link Merchant.ResolveOrderError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  resolveOrder(
    request: Merchant.ResolveOrderRequestParams,
    options?: RequestOptions,
  ): ApiPromise<ResolveOrderResult, Merchant.ResolveOrderError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/orders/{orderId}/resolve"),
        auth: noneAuth,
        pathParams: [{ name: "orderId", value: request.orderId, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: resolveOrderRequestSchema },
      },
      {
        success: { kind: "json", schema: resolveOrderResultSchema },
        errorFactory: Merchant.ResolveOrderError,
      },
      options,
    );
  }

  /**
   * Update the store's agent rules
   *
   * @remarks
   * Applies from the next checkout, for Undo's agent and every MCP agent. Each change is recorded
   * in the store's event chain.
   *
   * @returns The rules now in force.
   *
   * @throws {@link Merchant.UpdateMerchantRulesError} when the API answers with an error status —
   * narrow on `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  updateMerchantRules(
    request: Merchant.UpdateMerchantRulesRequest,
    options?: RequestOptions,
  ): ApiPromise<MerchantRules, Merchant.UpdateMerchantRulesError> {
    return this.#rawClient.execute(
      {
        method: "PUT",
        urlTemplate: this.#servers.default("/api/merchant/rules"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: merchantRulesSchema },
      },
      {
        success: { kind: "json", schema: merchantRulesSchema },
        errorFactory: Merchant.UpdateMerchantRulesError,
      },
      options,
    );
  }
}

export namespace Merchant {
  export type ListMerchantActivityRequest = {
    /** Only events with an id greater than this. */
    after?: number;
  };

  export type ResolveOrderRequestParams = {
    /** Undo order id. */
    orderId: string;
    /** The merchant's decision. */
    body: ResolveOrderRequest;
  };

  export class ResolveOrderError extends ApiError {
    declare readonly payload:
      | Declared<"error", Error>
      | Declared<"error2", Error>
      | Declared<"error3", Error>
      | Declared<"error4", Error>
      | Declared<"error5", Error>
      | Undeclared;

    static readonly errors: ErrorDecoders<ResolveOrderError> = [
      { on: 400, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 403, kind: "error2", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error3", decode: { kind: "json", schema: errorSchema } },
      { on: 409, kind: "error4", decode: { kind: "json", schema: errorSchema } },
      { on: 502, kind: "error5", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type UpdateMerchantRulesRequest = {
    /** The rules to apply from the next checkout. */
    body: MerchantRules;
  };

  export class UpdateMerchantRulesError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"rateLimited", RateLimited> | Undeclared;

    static readonly errors: ErrorDecoders<UpdateMerchantRulesError> = [
      { on: 400, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 429, kind: "rateLimited", decode: { kind: "json", schema: rateLimitedSchema } },
    ];
  }
}
