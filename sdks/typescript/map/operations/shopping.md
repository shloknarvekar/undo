<!-- Generated file — do not edit; regenerated with the SDK. -->

# Shopping — operations

Accessor: `client.shopping` · Source: `src/resources/shopping.ts` · 1 operation · Request and error types: namespace `Shopping`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `undo-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### shopMandate

- **Signature**: `shopMandate(request: Shopping.ShopMandateRequestParams, options?: RequestOptions): ApiPromise<ShopResult, Shopping.ShopMandateError>`
- **Wire**: `POST /api/mandates/{mandateId}/shop`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field. **Optional**: omit it and the request carries no body and no `Content-Type` header at all
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ShopResult`
- **Error**: `UndoApiError` with `kind: "api"`, an instance of `Shopping.ShopMandateError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [403] `Error` · `"error2"` [404] `Error` · `"error3"` [409] `Error` · `"error4"` [422] `Error` · `"rateLimited"` [429] `RateLimited` · `"error5"` [502] `Error` · `"error6"` [503] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Shopping.ShopMandateRequestParams` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `mandateId` | `path` | `string` | yes |
| `body` | `body` | `ShopMandateRequest` | no |

| Type | Schema value | Source |
| --- | --- | --- |
| `ShopMandateRequest` | `shopMandateRequestSchema` | `src/models/shop-mandate-request.ts` |
| `ShopResult` | `shopResultSchema` | `src/models/shop-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |
| `RateLimited` | `rateLimitedSchema` | `src/models/rate-limited.ts` |

