import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import * as s from "../core/validation/index.js";
import { healthSchema, type Health } from "../models/health.js";
import type { Servers } from "../servers.js";

/**
 * Health and deploy checks.
 */
export class Service {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Check the service
   *
   * @remarks
   * Shallow health check. With `deep`, also proves the service can reach PayPal sandbox and the
   * database. Never returns secret values.
   *
   * @returns Healthy.
   *
   * @throws {@link Service.GetHealthError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getHealth(
    request: Service.GetHealthRequest,
    options?: RequestOptions,
  ): ApiPromise<Health, Service.GetHealthError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/health"),
        auth: noneAuth,
        pathParams: [],
        query: [{ name: "deep", value: request.deep, schema: s.optional(s.string()) }],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: healthSchema },
        errorFactory: Service.GetHealthError,
      },
      options,
    );
  }
}

export namespace Service {
  export type GetHealthRequest = {
    /** Present (any value) to also check PayPal and the database. */
    deep?: string;
  };

  export class GetHealthError extends ApiError {
    declare readonly payload: Declared<"health", Health> | Undeclared;

    static readonly errors: ErrorDecoders<GetHealthError> = [
      { on: 503, kind: "health", decode: { kind: "json", schema: healthSchema } },
    ];
  }
}
