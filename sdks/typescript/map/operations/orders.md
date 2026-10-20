<!-- Generated file — do not edit; regenerated with the SDK. -->

# Orders — operations

Accessor: `client.orders` · Source: `src/resources/orders.ts` · 3 operations · Request and error types: namespace `Orders`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `undo-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### getOrder

- **Signature**: `getOrder(request: Orders.GetOrderRequest, options?: RequestOptions): ApiPromise<OrderView, Orders.GetOrderError>`
- **Wire**: `GET /api/orders/{orderId}`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `OrderView`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Orders.GetOrderError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Orders.GetOrderRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `orderId` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `OrderView` | `orderViewSchema` | `src/models/order-view.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### getOrderEvidence

- **Signature**: `getOrderEvidence(request: Orders.GetOrderEvidenceRequest, options?: RequestOptions): ApiPromise<Evidence, Orders.GetOrderEvidenceError>`
- **Wire**: `GET /api/orders/{orderId}/evidence`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `Evidence`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Orders.GetOrderEvidenceError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Orders.GetOrderEvidenceRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `orderId` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Evidence` | `evidenceSchema` | `src/models/evidence.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### undoOrder

- **Signature**: `undoOrder(request: Orders.UndoOrderRequest, options?: RequestOptions): ApiPromise<UndoResult, Orders.UndoOrderError>`
- **Wire**: `POST /api/orders/{orderId}/undo`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `UndoResult`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Orders.UndoOrderError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [400] `Error` · `"error2"` [403] `Error` · `"error3"` [404] `Error` · `"error4"` [409] `Error` · `"error5"` [413] `Error` · `"error6"` [422] `Error` · `"rateLimited"` [429] `RateLimited` · `"error7"` [502] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Orders.UndoOrderRequest` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `orderId` | `path` | `string` | yes |
| `body` | `body` | `UndoRequest` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `UndoRequest` | `undoRequestSchema` | `src/models/undo-request.ts` |
| `UndoResult` | `undoResultSchema` | `src/models/undo-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |
| `RateLimited` | `rateLimitedSchema` | `src/models/rate-limited.ts` |

