<!-- Generated file — do not edit; regenerated with the SDK. -->

# Products — operations

Accessor: `client.products` · Source: `src/resources/products.ts` · 2 operations · Request and error types: namespace `Products`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `undo-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### getProduct

- **Signature**: `getProduct(request: Products.GetProductRequest, options?: RequestOptions): ApiPromise<ProductDetail, Products.GetProductError>`
- **Wire**: `GET /api/products/{productId}`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `ProductDetail`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Products.GetProductError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [404] `Error` · `"error2"` [502] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Products.GetProductRequest` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `productId` | `path` | `string` | yes |
| `options` | `query` | `Record<string, string>` | no |

| Type | Schema value | Source |
| --- | --- | --- |
| `ProductDetail` | `productDetailSchema` | `src/models/product-detail.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### searchProducts

- **Signature**: `searchProducts(request: Products.SearchProductsRequest, options?: RequestOptions): ApiPromise<ProductSearchResult, Products.SearchProductsError>`
- **Wire**: `POST /api/products/search`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ProductSearchResult`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Products.SearchProductsError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [400] `Error` · `"rateLimited"` [429] `RateLimited` · `"error2"` [502] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Products.SearchProductsRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `ProductSearch` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `ProductSearch` | `productSearchSchema` | `src/models/product-search.ts` |
| `ProductSearchResult` | `productSearchResultSchema` | `src/models/product-search-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |
| `RateLimited` | `rateLimitedSchema` | `src/models/rate-limited.ts` |

