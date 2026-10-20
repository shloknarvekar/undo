import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { errorSchema, type Error } from "../models/error.js";
import { evidenceSchema, type Evidence } from "../models/evidence.js";
import { orderViewSchema, type OrderView } from "../models/order-view.js";
import { rateLimitedSchema, type RateLimited } from "../models/rate-limited.js";
import { undoRequestSchema, type UndoRequest } from "../models/undo-request.js";
import { undoResultSchema, type UndoResult } from "../models/undo-result.js";
import type { Servers } from "../servers.js";

/**
 * Purchases, their undo windows, the Undo button, and the evidence to verify them.
 */
export class Orders {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Get an order
   *
   * @remarks
   * The purchase, the live undo window, the mandate behind it, and its verified event chain. Each
   * event carries its proof.
   *
   * @returns The order.
   *
   * @throws {@link Orders.GetOrderError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getOrder(
    request: Orders.GetOrderRequest,
    options?: RequestOptions,
  ): ApiPromise<OrderView, Orders.GetOrderError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/orders/{orderId}"),
        auth: noneAuth,
        pathParams: [{ name: "orderId", value: request.orderId, schema: s.string() }],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: orderViewSchema },
        errorFactory: Orders.GetOrderError,
      },
      options,
    );
  }

  /**
   * Download the evidence for an order
   *
   * @remarks
   * Everything needed to check an order without trusting Undo: the raw hash-chained events exactly
   * as hashed and the signed mandate exactly as stored. Nothing is pre-verified, on purpose.
   *
   * @returns The evidence file (`undo-evidence-v1`).
   *
   * @throws {@link Orders.GetOrderEvidenceError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getOrderEvidence(
    request: Orders.GetOrderEvidenceRequest,
    options?: RequestOptions,
  ): ApiPromise<Evidence, Orders.GetOrderEvidenceError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/orders/{orderId}/evidence"),
        auth: noneAuth,
        pathParams: [{ name: "orderId", value: request.orderId, schema: s.string() }],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: evidenceSchema },
        errorFactory: Orders.GetOrderEvidenceError,
      },
      options,
    );
  }

  /**
   * Undo a purchase
   *
   * @remarks
   * The Undo button. Must be signed by the mandate's shopper key over
   * `undo-request-v1:<orderId>:<sha256 hex of reason>:<sha256 hex of photo bytes, or
   * ->:<requestedAt>`. `requestedAt` must be within 15 minutes of now. Runs the fault check, then
   * routes the money: a void inside the window, or a refund, merchant claim, return or human review
   * after capture. Rate limited per visitor.
   *
   * @returns The verdict and what happened to the money.
   *
   * @throws {@link Orders.UndoOrderError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  undoOrder(
    request: Orders.UndoOrderRequest,
    options?: RequestOptions,
  ): ApiPromise<UndoResult, Orders.UndoOrderError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/orders/{orderId}/undo"),
        auth: noneAuth,
        pathParams: [{ name: "orderId", value: request.orderId, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: undoRequestSchema },
      },
      {
        success: { kind: "json", schema: undoResultSchema },
        errorFactory: Orders.UndoOrderError,
      },
      options,
    );
  }
}

export namespace Orders {
  export type GetOrderRequest = {
    /** Undo order id. */
    orderId: string;
  };

  export class GetOrderError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Undeclared;

    static readonly errors: ErrorDecoders<GetOrderError> = [
      { on: 404, kind: "error", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type GetOrderEvidenceRequest = {
    /** Undo order id. */
    orderId: string;
  };

  export class GetOrderEvidenceError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Undeclared;

    static readonly errors: ErrorDecoders<GetOrderEvidenceError> = [
      { on: 404, kind: "error", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type UndoOrderRequest = {
    /** Undo order id. */
    orderId: string;
    /** Why the shopper is undoing, an optional photo, and their signature. */
    body: UndoRequest;
  };

  export class UndoOrderError extends ApiError {
    declare readonly payload:
      | Declared<"error", Error>
      | Declared<"error2", Error>
      | Declared<"error3", Error>
      | Declared<"error4", Error>
      | Declared<"error5", Error>
      | Declared<"error6", Error>
      | Declared<"rateLimited", RateLimited>
      | Declared<"error7", Error>
      | Undeclared;

    static readonly errors: ErrorDecoders<UndoOrderError> = [
      { on: 400, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 403, kind: "error2", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error3", decode: { kind: "json", schema: errorSchema } },
      { on: 409, kind: "error4", decode: { kind: "json", schema: errorSchema } },
      { on: 413, kind: "error5", decode: { kind: "json", schema: errorSchema } },
      { on: 422, kind: "error6", decode: { kind: "json", schema: errorSchema } },
      { on: 429, kind: "rateLimited", decode: { kind: "json", schema: rateLimitedSchema } },
      { on: 502, kind: "error7", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
