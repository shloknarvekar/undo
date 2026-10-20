<!-- Generated file — do not edit; regenerated with the SDK. -->

# Merchant — operations

Accessor: `client.merchant` · Source: `undo_api/apis/merchant.py` · 6 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.merchant.get_merchant_rules

- **Route**: `GET /api/merchant/rules`
- **Signature**: `def get_merchant_rules(*, request_options: RequestOptionsOrDict | None = None)`
- **Returns (parsed)**: `MerchantRules`
- **Returns (raw)**: `ApiResult[MerchantRules, RawError]`
- **Error**: `RawError` — **Case B**

| Type | Source |
| --- | --- |
| `MerchantRules` | `undo_api/models/merchant_rules.py` |

### client.merchant.list_merchant_activity

- **Route**: `GET /api/merchant/activity`
- **Signature**: `def list_merchant_activity(*, after: int | None = None, request_options: RequestOptionsOrDict | None = None)`
- **Params**: `after` — query
- **Returns (parsed)**: `ActivityFeed`
- **Returns (raw)**: `ApiResult[ActivityFeed, RawError]`
- **Error**: `RawError` — **Case B**

| Type | Source |
| --- | --- |
| `ActivityFeed` | `undo_api/models/activity_feed.py` |

### client.merchant.list_merchant_agents

- **Route**: `GET /api/merchant/agents`
- **Signature**: `def list_merchant_agents(*, request_options: RequestOptionsOrDict | None = None)`
- **Returns (parsed)**: `MerchantAgents`
- **Returns (raw)**: `ApiResult[MerchantAgents, RawError]`
- **Error**: `RawError` — **Case B**

| Type | Source |
| --- | --- |
| `MerchantAgents` | `undo_api/models/merchant_agents.py` |

### client.merchant.list_merchant_orders

- **Route**: `GET /api/merchant/orders`
- **Signature**: `def list_merchant_orders(*, request_options: RequestOptionsOrDict | None = None)`
- **Returns (parsed)**: `MerchantOrders`
- **Returns (raw)**: `ApiResult[MerchantOrders, RawError]`
- **Error**: `RawError` — **Case B**

| Type | Source |
| --- | --- |
| `MerchantOrders` | `undo_api/models/merchant_orders.py` |

### client.merchant.resolve_order

- **Route**: `POST /api/orders/{orderId}/resolve`
- **Signature**: `def resolve_order(order_id: UUID, body: ResolveOrderRequest | ResolveOrderRequestDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `order_id`, `body`
- **Params**: `order_id` — path `orderId` · `body` — JSON body
- **Returns (parsed)**: `ResolveOrderResult`
- **Returns (raw)**: `ApiResult[ResolveOrderResult, ResolveOrderErrorBody]`
- **Error**: `ResolveOrderErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [400, 403, 404, 409, 502] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `ResolveOrderRequest` | `undo_api/models/resolve_order_request.py` |
| `ResolveOrderRequestDict` | `undo_api/models/resolve_order_request.py` |
| `ResolveOrderResult` | `undo_api/models/resolve_order_result.py` |
| `ResolveOrderErrorBody` | `undo_api/errors/resolve_order_error.py` |
| `Error` | `undo_api/models/error.py` |

### client.merchant.update_merchant_rules

- **Route**: `PUT /api/merchant/rules`
- **Signature**: `def update_merchant_rules(body: MerchantRules | MerchantRulesDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `MerchantRules`
- **Returns (raw)**: `ApiResult[MerchantRules, UpdateMerchantRulesErrorBody]`
- **Error**: `UpdateMerchantRulesErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [400] · `RateLimited` [429] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `MerchantRules` | `undo_api/models/merchant_rules.py` |
| `MerchantRulesDict` | `undo_api/models/merchant_rules.py` |
| `UpdateMerchantRulesErrorBody` | `undo_api/errors/update_merchant_rules_error.py` |
| `Error` | `undo_api/models/error.py` |
| `RateLimited` | `undo_api/models/rate_limited.py` |

