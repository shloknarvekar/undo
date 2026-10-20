<!-- Generated file — do not edit; regenerated with the SDK. -->

# MandateRequests — operations

Accessor: `client.mandate_requests` · Source: `undo_api/apis/mandate_requests.py` · 2 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.mandate_requests.act_on_mandate_request

- **Route**: `POST /api/mandate-requests/{requestId}`
- **Signature**: `def act_on_mandate_request(request_id: UUID, body: MandateRequestAction | MandateRequestActionDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `request_id`, `body`
- **Params**: `request_id` — path `requestId` · `body` — JSON body
- **Returns (parsed)**: `MandateRequestActionResult`
- **Returns (raw)**: `ApiResult[MandateRequestActionResult, ActOnMandateRequestErrorBody]`
- **Error**: `ActOnMandateRequestErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [400, 404, 409, 422] · `RateLimited` [429] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `MandateRequestAction` | `undo_api/models/unions/mandate_request_action.py` |
| `MandateRequestActionDict` | `undo_api/models/unions/mandate_request_action.py` |
| `MandateRequestActionResult` | `undo_api/models/unions/mandate_request_action_result.py` |
| `ActOnMandateRequestErrorBody` | `undo_api/errors/act_on_mandate_request_error.py` |
| `Error` | `undo_api/models/error.py` |
| `RateLimited` | `undo_api/models/rate_limited.py` |

### client.mandate_requests.get_mandate_request

- **Route**: `GET /api/mandate-requests/{requestId}`
- **Signature**: `def get_mandate_request(request_id: UUID, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `request_id`
- **Params**: `request_id` — path `requestId`
- **Returns (parsed)**: `MandateRequest`
- **Returns (raw)**: `ApiResult[MandateRequest, GetMandateRequestErrorBody]`
- **Error**: `GetMandateRequestErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `MandateRequest` | `undo_api/models/mandate_request.py` |
| `GetMandateRequestErrorBody` | `undo_api/errors/get_mandate_request_error.py` |
| `Error` | `undo_api/models/error.py` |

