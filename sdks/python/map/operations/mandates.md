<!-- Generated file — do not edit; regenerated with the SDK. -->

# Mandates — operations

Accessor: `client.mandates` · Source: `undo_api/apis/mandates.py` · 4 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.mandates.draft_mandate

- **Route**: `POST /api/mandates/draft`
- **Signature**: `def draft_mandate(body: DraftMandateRequest | DraftMandateRequestDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `DraftResult`
- **Returns (raw)**: `ApiResult[DraftResult, DraftMandateErrorBody]`
- **Error**: `DraftMandateErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [400, 502, 503] · `RateLimited` [429] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `DraftMandateRequest` | `undo_api/models/draft_mandate_request.py` |
| `DraftMandateRequestDict` | `undo_api/models/draft_mandate_request.py` |
| `DraftResult` | `undo_api/models/draft_result.py` |
| `DraftMandateErrorBody` | `undo_api/errors/draft_mandate_error.py` |
| `Error` | `undo_api/models/error.py` |
| `RateLimited` | `undo_api/models/rate_limited.py` |

### client.mandates.get_mandate

- **Route**: `GET /api/mandates/{mandateId}`
- **Signature**: `def get_mandate(mandate_id: UUID, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `mandate_id`
- **Params**: `mandate_id` — path `mandateId`
- **Returns (parsed)**: `MandateView`
- **Returns (raw)**: `ApiResult[MandateView, GetMandateErrorBody]`
- **Error**: `GetMandateErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `MandateView` | `undo_api/models/mandate_view.py` |
| `GetMandateErrorBody` | `undo_api/errors/get_mandate_error.py` |
| `Error` | `undo_api/models/error.py` |

### client.mandates.prepare_mandate

- **Route**: `POST /api/mandates/prepare`
- **Signature**: `def prepare_mandate(body: PrepareMandate | PrepareMandateDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `PreparedMandate`
- **Returns (raw)**: `ApiResult[PreparedMandate, PrepareMandateErrorBody]`
- **Error**: `PrepareMandateErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [400] · `NotReady` [422] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `PrepareMandate` | `undo_api/models/prepare_mandate.py` |
| `PrepareMandateDict` | `undo_api/models/prepare_mandate.py` |
| `PreparedMandate` | `undo_api/models/prepared_mandate.py` |
| `PrepareMandateErrorBody` | `undo_api/errors/prepare_mandate_error.py` |
| `Error` | `undo_api/models/error.py` |
| `NotReady` | `undo_api/models/not_ready.py` |

### client.mandates.store_mandate

- **Route**: `POST /api/mandates`
- **Signature**: `def store_mandate(body: SignedMandate | SignedMandateDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `StoredMandate`
- **Returns (raw)**: `ApiResult[StoredMandate, StoreMandateErrorBody]`
- **Error**: `StoreMandateErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [400, 403, 409, 422] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `SignedMandate` | `undo_api/models/signed_mandate.py` |
| `SignedMandateDict` | `undo_api/models/signed_mandate.py` |
| `StoredMandate` | `undo_api/models/stored_mandate.py` |
| `StoreMandateErrorBody` | `undo_api/errors/store_mandate_error.py` |
| `Error` | `undo_api/models/error.py` |

