import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { draftMandateRequestSchema, type DraftMandateRequest } from "../models/draft-mandate-request.js";
import { draftResultSchema, type DraftResult } from "../models/draft-result.js";
import { errorSchema, type Error } from "../models/error.js";
import { mandateViewSchema, type MandateView } from "../models/mandate-view.js";
import { notReadySchema, type NotReady } from "../models/not-ready.js";
import { prepareMandateSchema, type PrepareMandate } from "../models/prepare-mandate.js";
import { preparedMandateSchema, type PreparedMandate } from "../models/prepared-mandate.js";
import { rateLimitedSchema, type RateLimited } from "../models/rate-limited.js";
import { signedMandateSchema, type SignedMandate } from "../models/signed-mandate.js";
import { storedMandateSchema, type StoredMandate } from "../models/stored-mandate.js";
import type { Servers } from "../servers.js";

/**
 * Drafting, preparing, signing and reading shopper-signed intent mandates.
 */
export class Mandates {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Draft a mandate from the shopper's words
   *
   * @remarks
   * Turns a plain request into structured limits for the shopper to review. Nothing is stored. Rate
   * limited per visitor.
   *
   * @returns The draft and whether it can be signed as is.
   *
   * @throws {@link Mandates.DraftMandateError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  draftMandate(
    request: Mandates.DraftMandateRequestParams,
    options?: RequestOptions,
  ): ApiPromise<DraftResult, Mandates.DraftMandateError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/mandates/draft"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: draftMandateRequestSchema },
      },
      {
        success: { kind: "json", schema: draftResultSchema },
        errorFactory: Mandates.DraftMandateError,
      },
      options,
    );
  }

  /**
   * Get a mandate and check its integrity
   *
   * @remarks
   * The mandate, its status, the search it permits, and a fresh check of its digest, signature and
   * event chain.
   *
   * @returns The mandate with a live integrity check.
   *
   * @throws {@link Mandates.GetMandateError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getMandate(
    request: Mandates.GetMandateRequest,
    options?: RequestOptions,
  ): ApiPromise<MandateView, Mandates.GetMandateError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/mandates/{mandateId}"),
        auth: noneAuth,
        pathParams: [{ name: "mandateId", value: request.mandateId, schema: s.string() }],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: mandateViewSchema },
        errorFactory: Mandates.GetMandateError,
      },
      options,
    );
  }

  /**
   * Build the exact mandate to sign
   *
   * @remarks
   * Returns the mandate the shopper's device must sign and the exact `signingMessage`
   * (`undo-intent-mandate-v1:<sha256 of the canonical mandate JSON>`). Stateless; nothing is
   * stored.
   *
   * @returns The mandate and the string to sign.
   *
   * @throws {@link Mandates.PrepareMandateError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  prepareMandate(
    request: Mandates.PrepareMandateRequest,
    options?: RequestOptions,
  ): ApiPromise<PreparedMandate, Mandates.PrepareMandateError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/mandates/prepare"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: prepareMandateSchema },
      },
      {
        success: { kind: "json", schema: preparedMandateSchema },
        errorFactory: Mandates.PrepareMandateError,
      },
      options,
    );
  }

  /**
   * Store a signed mandate
   *
   * @remarks
   * Re-verifies the signature, freshness, expiry and readiness, then writes the first event of the
   * mandate's hash chain.
   *
   * @returns Stored.
   *
   * @throws {@link Mandates.StoreMandateError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  storeMandate(
    request: Mandates.StoreMandateRequest,
    options?: RequestOptions,
  ): ApiPromise<StoredMandate, Mandates.StoreMandateError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/mandates"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: signedMandateSchema },
      },
      {
        success: { kind: "json", schema: storedMandateSchema },
        errorFactory: Mandates.StoreMandateError,
      },
      options,
    );
  }
}

export namespace Mandates {
  export type DraftMandateRequestParams = {
    /** The shopper's request in their own words. */
    body: DraftMandateRequest;
  };

  export class DraftMandateError extends ApiError {
    declare readonly payload:
      | Declared<"error", Error>
      | Declared<"rateLimited", RateLimited>
      | Declared<"error2", Error>
      | Declared<"error3", Error>
      | Undeclared;

    static readonly errors: ErrorDecoders<DraftMandateError> = [
      { on: 400, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 429, kind: "rateLimited", decode: { kind: "json", schema: rateLimitedSchema } },
      { on: 502, kind: "error2", decode: { kind: "json", schema: errorSchema } },
      { on: 503, kind: "error3", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type GetMandateRequest = {
    /** Mandate id. */
    mandateId: string;
  };

  export class GetMandateError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Undeclared;

    static readonly errors: ErrorDecoders<GetMandateError> = [
      { on: 404, kind: "error", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type PrepareMandateRequest = {
    /** The draft, the shopper's words and the device key that will sign. */
    body: PrepareMandate;
  };

  export class PrepareMandateError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"notReady", NotReady> | Undeclared;

    static readonly errors: ErrorDecoders<PrepareMandateError> = [
      { on: 400, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 422, kind: "notReady", decode: { kind: "json", schema: notReadySchema } },
    ];
  }

  export type StoreMandateRequest = {
    /** The mandate and the shopper's signature over it. */
    body: SignedMandate;
  };

  export class StoreMandateError extends ApiError {
    declare readonly payload:
      | Declared<"error", Error>
      | Declared<"error2", Error>
      | Declared<"error3", Error>
      | Declared<"error4", Error>
      | Undeclared;

    static readonly errors: ErrorDecoders<StoreMandateError> = [
      { on: 400, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 403, kind: "error2", decode: { kind: "json", schema: errorSchema } },
      { on: 409, kind: "error3", decode: { kind: "json", schema: errorSchema } },
      { on: 422, kind: "error4", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
