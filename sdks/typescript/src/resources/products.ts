import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { errorSchema, type Error } from "../models/error.js";
import { productDetailSchema, type ProductDetail } from "../models/product-detail.js";
import { productSearchResultSchema, type ProductSearchResult } from "../models/product-search-result.js";
import { productSearchSchema, type ProductSearch } from "../models/product-search.js";
import { rateLimitedSchema, type RateLimited } from "../models/rate-limited.js";
import type { Servers } from "../servers.js";

/**
 * Live product catalog search and detail, resolved to an exact variant.
 */
export class Products {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Get a product at a variant
   *
   * @remarks
   * Fresh product detail resolved to the requested variant. Pass options as `option_<Name>=<value>`
   * query parameters, for example `option_Size=M&option_Color=Black`. `relaxed` lists any option
   * the catalog could not honor.
   *
   * @returns The product at the closest available variant.
   *
   * @throws {@link Products.GetProductError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getProduct(
    request: Products.GetProductRequest,
    options?: RequestOptions,
  ): ApiPromise<ProductDetail, Products.GetProductError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/products/{productId}"),
        auth: noneAuth,
        pathParams: [{ name: "productId", value: request.productId, schema: s.string() }],
        query: [
          { name: "options", value: request.options, schema: s.optional(s.record(s.string(), s.string())) },
        ],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: productDetailSchema },
        errorFactory: Products.GetProductError,
      },
      options,
    );
  }

  /**
   * Search products
   *
   * @remarks
   * Searches the live catalog with structured filters. Rate limited per visitor.
   *
   * @returns Matching products with an offer.
   *
   * @throws {@link Products.SearchProductsError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link UndoApiError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  searchProducts(
    request: Products.SearchProductsRequest,
    options?: RequestOptions,
  ): ApiPromise<ProductSearchResult, Products.SearchProductsError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/products/search"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: productSearchSchema },
      },
      {
        success: { kind: "json", schema: productSearchResultSchema },
        errorFactory: Products.SearchProductsError,
      },
      options,
    );
  }
}

export namespace Products {
  export type GetProductRequest = {
    /** Catalog product id (`channel3Id` from a search). */
    productId: string;
    /** Variant options as `option_<Name>` keys. */
    options?: Record<string, string>;
  };

  export class GetProductError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<GetProductError> = [
      { on: 404, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 502, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type SearchProductsRequest = {
    /** What to search for and how to filter it. */
    body: ProductSearch;
  };

  export class SearchProductsError extends ApiError {
    declare readonly payload:
      | Declared<"error", Error>
      | Declared<"rateLimited", RateLimited>
      | Declared<"error2", Error>
      | Undeclared;

    static readonly errors: ErrorDecoders<SearchProductsError> = [
      { on: 400, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 429, kind: "rateLimited", decode: { kind: "json", schema: rateLimitedSchema } },
      { on: 502, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
