import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { errorSchema, type Error } from "../models/error.js";
import { rateLimitedSchema, type RateLimited } from "../models/rate-limited.js";
import { shopMandateRequestSchema, type ShopMandateRequest } from "../models/shop-mandate-request.js";
import { shopResultSchema, type ShopResult } from "../models/shop-result.js";
import type { Servers } from "../servers.js";

/**
 * Let Undo's agent shop inside a mandate and open a PayPal checkout that only authorizes the money.
 */
export class Shopping {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Shop inside a mandate
   *
   * @remarks
   * Undo's agent searches, checks the cart against the signed limits, and opens a PayPal checkout
   * in AUTHORIZE mode. Without a saved wallet the shopper approves at `approveUrl`; with one (and
   * only if the mandate allows it) the money is held straight away. One live purchase per mandate.
   * Rate limited per visitor.
   *
   * @returns Checkout opened.
   *
   * @throws {@link Shopping.ShopMandateError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  shopMandate(
    request: Shopping.ShopMandateRequestParams,
    options?: RequestOptions,
  ): ApiPromise<ShopResult, Shopping.ShopMandateError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/mandates/{mandateId}/shop"),
        auth: noneAuth,
        pathParams: [{ name: "mandateId", value: request.mandateId, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: {
          kind: "json",
          value: request.body,
          schema: s.optional(s.lazy(() => shopMandateRequestSchema)),
        },
      },
      {
        success: { kind: "json", schema: shopResultSchema },
        errorFactory: Shopping.ShopMandateError,
      },
      options,
    );
  }
}

export namespace Shopping {
  export type ShopMandateRequestParams = {
    /** Mandate id. */
    mandateId: string;
    /** Optional demo settings. Send {} for a normal run. */
    body?: ShopMandateRequest;
  };

  export class ShopMandateError extends ApiError {
    declare readonly payload:
      | Declared<"error", Error>
      | Declared<"error2", Error>
      | Declared<"error3", Error>
      | Declared<"error4", Error>
      | Declared<"rateLimited", RateLimited>
      | Declared<"error5", Error>
      | Declared<"error6", Error>
      | Undeclared;

    static readonly errors: ErrorDecoders<ShopMandateError> = [
      { on: 403, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
      { on: 409, kind: "error3", decode: { kind: "json", schema: errorSchema } },
      { on: 422, kind: "error4", decode: { kind: "json", schema: errorSchema } },
      { on: 429, kind: "rateLimited", decode: { kind: "json", schema: rateLimitedSchema } },
      { on: 502, kind: "error5", decode: { kind: "json", schema: errorSchema } },
      { on: 503, kind: "error6", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
