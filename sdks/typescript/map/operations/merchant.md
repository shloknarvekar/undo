<!-- Generated file — do not edit; regenerated with the SDK. -->

# Merchant — operations

Accessor: `client.merchant` · Source: `src/resources/merchant.ts` · 6 operations · Request and error types: namespace `Merchant`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `undo-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### getMerchantRules

- **Signature**: `getMerchantRules(options?: RequestOptions): ApiPromise<MerchantRules, ApiError>`
- **Wire**: `GET /api/merchant/rules`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `MerchantRules`
- **Error**: `UndoApiError` with `kind: "api"` — untyped, `payload.kind` always `"undeclared"`

| Type | Schema value | Source |
| --- | --- | --- |
| `MerchantRules` | `merchantRulesSchema` | `src/models/merchant-rules.ts` |

### listMerchantActivity

- **Signature**: `listMerchantActivity(request: Merchant.ListMerchantActivityRequest, options?: RequestOptions): ApiPromise<ActivityFeed, ApiError>`
- **Wire**: `GET /api/merchant/activity`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `ActivityFeed`
- **Error**: `UndoApiError` with `kind: "api"` — untyped, `payload.kind` always `"undeclared"`

**Fields** — `Merchant.ListMerchantActivityRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `after` | `query` | `number` | no |

| Type | Schema value | Source |
| --- | --- | --- |
| `ActivityFeed` | `activityFeedSchema` | `src/models/activity-feed.ts` |

### listMerchantAgents

- **Signature**: `listMerchantAgents(options?: RequestOptions): ApiPromise<MerchantAgents, ApiError>`
- **Wire**: `GET /api/merchant/agents`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `MerchantAgents`
- **Error**: `UndoApiError` with `kind: "api"` — untyped, `payload.kind` always `"undeclared"`

| Type | Schema value | Source |
| --- | --- | --- |
| `MerchantAgents` | `merchantAgentsSchema` | `src/models/merchant-agents.ts` |

### listMerchantOrders

- **Signature**: `listMerchantOrders(options?: RequestOptions): ApiPromise<MerchantOrders, ApiError>`
- **Wire**: `GET /api/merchant/orders`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `MerchantOrders`
- **Error**: `UndoApiError` with `kind: "api"` — untyped, `payload.kind` always `"undeclared"`

| Type | Schema value | Source |
| --- | --- | --- |
| `MerchantOrders` | `merchantOrdersSchema` | `src/models/merchant-orders.ts` |

### resolveOrder

- **Signature**: `resolveOrder(request: Merchant.ResolveOrderRequestParams, options?: RequestOptions): ApiPromise<ResolveOrderResult, Merchant.ResolveOrderError>`
- **Wire**: `POST /api/orders/{orderId}/resolve`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ResolveOrderResult`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Merchant.ResolveOrderError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [400] `Error` · `"error2"` [403] `Error` · `"error3"` [404] `Error` · `"error4"` [409] `Error` · `"error5"` [502] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Merchant.ResolveOrderRequestParams` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `orderId` | `path` | `string` | yes |
| `body` | `body` | `ResolveOrderRequest` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `ResolveOrderRequest` | `resolveOrderRequestSchema` | `src/models/resolve-order-request.ts` |
| `ResolveOrderResult` | `resolveOrderResultSchema` | `src/models/resolve-order-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### updateMerchantRules

- **Signature**: `updateMerchantRules(request: Merchant.UpdateMerchantRulesRequest, options?: RequestOptions): ApiPromise<MerchantRules, Merchant.UpdateMerchantRulesError>`
- **Wire**: `PUT /api/merchant/rules`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `MerchantRules`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Merchant.UpdateMerchantRulesError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [400] `Error` · `"rateLimited"` [429] `RateLimited` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Merchant.UpdateMerchantRulesRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `MerchantRules` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `MerchantRules` | `merchantRulesSchema` | `src/models/merchant-rules.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |
| `RateLimited` | `rateLimitedSchema` | `src/models/rate-limited.ts` |

