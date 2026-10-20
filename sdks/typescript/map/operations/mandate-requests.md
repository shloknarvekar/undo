<!-- Generated file — do not edit; regenerated with the SDK. -->

# MandateRequests — operations

Accessor: `client.mandateRequests` · Source: `src/resources/mandate-requests.ts` · 2 operations · Request and error types: namespace `MandateRequests`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `undo-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### actOnMandateRequest

- **Signature**: `actOnMandateRequest(request: MandateRequests.ActOnMandateRequestRequest, options?: RequestOptions): ApiPromise<MandateRequestActionResult, MandateRequests.ActOnMandateRequestError>`
- **Wire**: `POST /api/mandate-requests/{requestId}`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `MandateRequestActionResult`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `MandateRequests.ActOnMandateRequestError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [400] `Error` · `"error2"` [404] `Error` · `"error3"` [409] `Error` · `"error4"` [422] `Error` · `"rateLimited"` [429] `RateLimited` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `MandateRequests.ActOnMandateRequestRequest` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `requestId` | `path` | `string` | yes |
| `body` | `body` | `MandateRequestAction` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `MandateRequestAction` | `mandateRequestActionSchema` | `src/models/unions/mandate-request-action.ts` |
| `MandateRequestActionResult` | `mandateRequestActionResultSchema` | `src/models/unions/mandate-request-action-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |
| `RateLimited` | `rateLimitedSchema` | `src/models/rate-limited.ts` |

### getMandateRequest

- **Signature**: `getMandateRequest(request: MandateRequests.GetMandateRequestRequest, options?: RequestOptions): ApiPromise<MandateRequest, MandateRequests.GetMandateRequestError>`
- **Wire**: `GET /api/mandate-requests/{requestId}`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `MandateRequest`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `MandateRequests.GetMandateRequestError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `MandateRequests.GetMandateRequestRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `requestId` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `MandateRequest` | `mandateRequestSchema` | `src/models/mandate-request.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

