<!-- Generated file — do not edit; regenerated with the SDK. -->

# Mandates — operations

Accessor: `client.mandates` · Source: `src/resources/mandates.ts` · 4 operations · Request and error types: namespace `Mandates`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `undo-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### draftMandate

- **Signature**: `draftMandate(request: Mandates.DraftMandateRequestParams, options?: RequestOptions): ApiPromise<DraftResult, Mandates.DraftMandateError>`
- **Wire**: `POST /api/mandates/draft`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `DraftResult`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Mandates.DraftMandateError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [400] `Error` · `"rateLimited"` [429] `RateLimited` · `"error2"` [502] `Error` · `"error3"` [503] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Mandates.DraftMandateRequestParams` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `DraftMandateRequest` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `DraftMandateRequest` | `draftMandateRequestSchema` | `src/models/draft-mandate-request.ts` |
| `DraftResult` | `draftResultSchema` | `src/models/draft-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |
| `RateLimited` | `rateLimitedSchema` | `src/models/rate-limited.ts` |

### getMandate

- **Signature**: `getMandate(request: Mandates.GetMandateRequest, options?: RequestOptions): ApiPromise<MandateView, Mandates.GetMandateError>`
- **Wire**: `GET /api/mandates/{mandateId}`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `MandateView`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Mandates.GetMandateError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Mandates.GetMandateRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `mandateId` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `MandateView` | `mandateViewSchema` | `src/models/mandate-view.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### prepareMandate

- **Signature**: `prepareMandate(request: Mandates.PrepareMandateRequest, options?: RequestOptions): ApiPromise<PreparedMandate, Mandates.PrepareMandateError>`
- **Wire**: `POST /api/mandates/prepare`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `PreparedMandate`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Mandates.PrepareMandateError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [400] `Error` · `"notReady"` [422] `NotReady` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Mandates.PrepareMandateRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `PrepareMandate` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `PrepareMandate` | `prepareMandateSchema` | `src/models/prepare-mandate.ts` |
| `PreparedMandate` | `preparedMandateSchema` | `src/models/prepared-mandate.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |
| `NotReady` | `notReadySchema` | `src/models/not-ready.ts` |

### storeMandate

- **Signature**: `storeMandate(request: Mandates.StoreMandateRequest, options?: RequestOptions): ApiPromise<StoredMandate, Mandates.StoreMandateError>`
- **Wire**: `POST /api/mandates`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `StoredMandate`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Mandates.StoreMandateError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [400] `Error` · `"error2"` [403] `Error` · `"error3"` [409] `Error` · `"error4"` [422] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Mandates.StoreMandateRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `SignedMandate` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `SignedMandate` | `signedMandateSchema` | `src/models/signed-mandate.ts` |
| `StoredMandate` | `storedMandateSchema` | `src/models/stored-mandate.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

