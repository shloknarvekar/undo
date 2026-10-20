<!-- Generated file — do not edit; regenerated with the SDK. -->

# Products — operations

Accessor: `client.products` · Source: `undo_api/apis/products.py` · 2 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.products.get_product

- **Route**: `GET /api/products/{productId}`
- **Signature**: `def get_product(product_id: str, *, options: dict[str, str] | None = None, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `product_id`
- **Params**: `product_id` — path `productId` · `options` — query
- **Returns (parsed)**: `ProductDetail`
- **Returns (raw)**: `ApiResult[ProductDetail, GetProductErrorBody]`
- **Error**: `GetProductErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [404, 502] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `ProductDetail` | `undo_api/models/product_detail.py` |
| `GetProductErrorBody` | `undo_api/errors/get_product_error.py` |
| `Error` | `undo_api/models/error.py` |

### client.products.search_products

- **Route**: `POST /api/products/search`
- **Signature**: `def search_products(body: ProductSearch | ProductSearchDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `ProductSearchResult`
- **Returns (raw)**: `ApiResult[ProductSearchResult, SearchProductsErrorBody]`
- **Error**: `SearchProductsErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [400, 502] · `RateLimited` [429] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `ProductSearch` | `undo_api/models/product_search.py` |
| `ProductSearchDict` | `undo_api/models/product_search.py` |
| `ProductSearchResult` | `undo_api/models/product_search_result.py` |
| `SearchProductsErrorBody` | `undo_api/errors/search_products_error.py` |
| `Error` | `undo_api/models/error.py` |
| `RateLimited` | `undo_api/models/rate_limited.py` |

