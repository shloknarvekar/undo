<!-- Generated file — do not edit; regenerated with the SDK. -->

# Shopping — operations

Accessor: `client.shopping` · Source: `undo_api/apis/shopping.py` · 1 operation

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.shopping.shop_mandate

- **Route**: `POST /api/mandates/{mandateId}/shop`
- **Signature**: `def shop_mandate(mandate_id: UUID, *, body: ShopMandateRequest | ShopMandateRequestDict | None = None, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `mandate_id`
- **Params**: `mandate_id` — path `mandateId` · `body` — JSON body
- **Returns (parsed)**: `ShopResult`
- **Returns (raw)**: `ApiResult[ShopResult, ShopMandateErrorBody]`
- **Error**: `ShopMandateErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [403, 404, 409, 422, 502, 503] · `RateLimited` [429] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `ShopMandateRequest` | `undo_api/models/shop_mandate_request.py` |
| `ShopMandateRequestDict` | `undo_api/models/shop_mandate_request.py` |
| `ShopResult` | `undo_api/models/shop_result.py` |
| `ShopMandateErrorBody` | `undo_api/errors/shop_mandate_error.py` |
| `Error` | `undo_api/models/error.py` |
| `RateLimited` | `undo_api/models/rate_limited.py` |

