<!-- Generated file — do not edit; regenerated with the SDK. -->

# Service — operations

Accessor: `client.service` · Source: `undo_api/apis/service.py` · 1 operation

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.service.get_health

- **Route**: `GET /api/health`
- **Signature**: `def get_health(*, deep: str | None = None, request_options: RequestOptionsOrDict | None = None)`
- **Params**: `deep` — query
- **Returns (parsed)**: `Health`
- **Returns (raw)**: `ApiResult[Health, GetHealthErrorBody]`
- **Error**: `GetHealthErrorBody` — **Case A (typed)**
- **Error arms**: `Health` [503] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Health` | `undo_api/models/health.py` |
| `GetHealthErrorBody` | `undo_api/errors/get_health_error.py` |

