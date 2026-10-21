# Errors and limits (/docs/guides/errors-and-limits)



## Error shape [#error-shape]

Every error is JSON with a stable `error` code. Some add a `detail` in plain words, and validation errors list `issues`.

```json
{ "error": "invalid_request", "issues": [{ "code": "too_small", "message": "String must contain at least 3 character(s)", "path": ["request"] }] }
```

## Common codes [#common-codes]

| Status | `error`                                                   | Meaning                                                                        |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 400    | `invalid_request`                                         | The body failed validation; see `issues`.                                      |
| 403    | `bad_signature`                                           | The signature doesn't verify against the mandate's key.                        |
| 403    | `agent_blocked`                                           | The store's rules refuse this agent; `detail` says why.                        |
| 404    | `not_found`                                               | No such order, mandate or request.                                             |
| 409    | `purchase_already_open`                                   | The mandate already has a live purchase; `orderId` names it.                   |
| 409    | `not_undoable`                                            | The order isn't held or captured any more, for example it was already voided.  |
| 409    | `order_changed_retry`                                     | The order changed while this request ran. Read it again and retry.             |
| 413    | `photo_too_large`                                         | The photo is over 4 MB.                                                        |
| 422    | `open_questions`, `missing_budget`                        | The draft can't be signed yet; `mustAsk` lists what's missing.                 |
| 422    | `stale_request`                                           | `requestedAt` is more than 15 minutes from the server's clock.                 |
| 422    | `no_compliant_product`                                    | Nothing in the catalog fits the mandate; `considered` lists what was checked.  |
| 422    | `mandate_does_not_match_request`                          | The signed mandate differs from the request the agent made.                    |
| 429    | `rate_limited`                                            | Too many requests, or a free-tier budget is spent. Wait `Retry-After` seconds. |
| 502    | `paypal_checkout_failed`, `undo_failed`, `channel3_error` | PayPal or the catalog failed. Safe to retry.                                   |
| 503    | `ai_unavailable`, `parser_unavailable`                    | The AI model is unavailable. Try again shortly.                                |

## Rate limits [#rate-limits]

Limits are per visitor, over sliding windows. A `429` response carries a `Retry-After` header and a `retryAfter` field in seconds.

| What                       | Per minute | Per hour |
| -------------------------- | ---------- | -------- |
| Drafting a mandate         | 6          | 30       |
| Shopping inside a mandate  | 4          | 20       |
| Product search             | 10         | 60       |
| Undo                       | 6          | 30       |
| MCP tool calls             | 60         | 600      |
| Changing the store's rules | 10         | 60       |

The AI model and the product catalog also have daily and monthly budgets shared by everyone. When one is spent, those endpoints return `429` until it resets.

## Retries [#retries]

Every money call to PayPal carries a fixed `PayPal-Request-Id` per order, so retrying a void, capture or refund never moves money twice.
