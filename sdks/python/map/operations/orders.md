<!-- Generated file — do not edit; regenerated with the SDK. -->

# Orders — operations

Accessor: `client.orders` · Source: `undo_api/apis/orders.py` · 3 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.orders.get_order

- **Route**: `GET /api/orders/{orderId}`
- **Signature**: `def get_order(order_id: UUID, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `order_id`
- **Params**: `order_id` — path `orderId`
- **Returns (parsed)**: `OrderView`
- **Returns (raw)**: `ApiResult[OrderView, GetOrderErrorBody]`
- **Error**: `GetOrderErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `OrderView` | `undo_api/models/order_view.py` |
| `GetOrderErrorBody` | `undo_api/errors/get_order_error.py` |
| `Error` | `undo_api/models/error.py` |

### client.orders.get_order_evidence

- **Route**: `GET /api/orders/{orderId}/evidence`
- **Signature**: `def get_order_evidence(order_id: UUID, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `order_id`
- **Params**: `order_id` — path `orderId`
- **Returns (parsed)**: `Evidence`
- **Returns (raw)**: `ApiResult[Evidence, GetOrderEvidenceErrorBody]`
- **Error**: `GetOrderEvidenceErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Evidence` | `undo_api/models/evidence.py` |
| `GetOrderEvidenceErrorBody` | `undo_api/errors/get_order_evidence_error.py` |
| `Error` | `undo_api/models/error.py` |

### client.orders.undo_order

- **Route**: `POST /api/orders/{orderId}/undo`
- **Signature**: `def undo_order(order_id: UUID, body: UndoRequest | UndoRequestDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `order_id`, `body`
- **Params**: `order_id` — path `orderId` · `body` — JSON body
- **Returns (parsed)**: `UndoResult`
- **Returns (raw)**: `ApiResult[UndoResult, UndoOrderErrorBody]`
- **Error**: `UndoOrderErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [400, 403, 404, 409, 413, 422, 502] · `RateLimited` [429] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `UndoRequest` | `undo_api/models/undo_request.py` |
| `UndoRequestDict` | `undo_api/models/undo_request.py` |
| `UndoResult` | `undo_api/models/undo_result.py` |
| `UndoOrderErrorBody` | `undo_api/errors/undo_order_error.py` |
| `Error` | `undo_api/models/error.py` |
| `RateLimited` | `undo_api/models/rate_limited.py` |

