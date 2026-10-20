import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { errorSchema, type Error } from "../models/error.js";
import { mandateRequestSchema, type MandateRequest } from "../models/mandate-request.js";
import { rateLimitedSchema, type RateLimited } from "../models/rate-limited.js";
import {
  mandateRequestActionResultSchema,
  type MandateRequestActionResult,
} from "../models/unions/mandate-request-action-result.js";
import {
  mandateRequestActionSchema,
  type MandateRequestAction,
} from "../models/unions/mandate-request-action.js";
import type { Servers } from "../servers.js";

/**
 * The shopper's side of a mandate an outside agent asked for.
 */
export class MandateRequests {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Answer, prepare or sign a mandate request
   *
   * @remarks
   * - `answer`: answers the agent's open questions; the draft is re-read from the new text.
   * - `prepare`: the exact mandate this device's key must sign.
   * - `sign`: stores the signed mandate; it must match the request byte for byte (same words,
   *   limits and agent).
   *
   * @returns Answered (new draft) or prepared (mandate and signing message).
   *
   * @throws {@link MandateRequests.ActOnMandateRequestError} when the API answers with an error
   * status — narrow on `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  actOnMandateRequest(
    request: MandateRequests.ActOnMandateRequestRequest,
    options?: RequestOptions,
  ): ApiPromise<MandateRequestActionResult, MandateRequests.ActOnMandateRequestError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/mandate-requests/{requestId}"),
        auth: noneAuth,
        pathParams: [{ name: "requestId", value: request.requestId, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: mandateRequestActionSchema },
      },
      {
        success: { kind: "json", schema: mandateRequestActionResultSchema },
        errorFactory: MandateRequests.ActOnMandateRequestError,
      },
      options,
    );
  }

  /**
   * Get a mandate request
   *
   * @remarks
   * The draft an outside agent asked the shopper to sign, who is asking, and whether it is signed
   * yet.
   *
   * @returns The request.
   *
   * @throws {@link MandateRequests.GetMandateRequestError} when the API answers with an error
   * status — narrow on `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getMandateRequest(
    request: MandateRequests.GetMandateRequestRequest,
    options?: RequestOptions,
  ): ApiPromise<MandateRequest, MandateRequests.GetMandateRequestError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/mandate-requests/{requestId}"),
        auth: noneAuth,
        pathParams: [{ name: "requestId", value: request.requestId, schema: s.string() }],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: mandateRequestSchema },
        errorFactory: MandateRequests.GetMandateRequestError,
      },
      options,
    );
  }
}

export namespace MandateRequests {
  export type ActOnMandateRequestRequest = {
    /** Mandate request id. */
    requestId: string;
    /** The shopper's answer, a request to prepare the mandate, or the signed mandate. */
    body: MandateRequestAction;
  };

  export class ActOnMandateRequestError extends ApiError {
    declare readonly payload:
      | Declared<"error", Error>
      | Declared<"error2", Error>
      | Declared<"error3", Error>
      | Declared<"error4", Error>
      | Declared<"rateLimited", RateLimited>
      | Undeclared;

    static readonly errors: ErrorDecoders<ActOnMandateRequestError> = [
      { on: 400, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
      { on: 409, kind: "error3", decode: { kind: "json", schema: errorSchema } },
      { on: 422, kind: "error4", decode: { kind: "json", schema: errorSchema } },
      { on: 429, kind: "rateLimited", decode: { kind: "json", schema: rateLimitedSchema } },
    ];
  }

  export type GetMandateRequestRequest = {
    /** Mandate request id. */
    requestId: string;
  };

  export class GetMandateRequestError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Undeclared;

    static readonly errors: ErrorDecoders<GetMandateRequestError> = [
      { on: 404, kind: "error", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
