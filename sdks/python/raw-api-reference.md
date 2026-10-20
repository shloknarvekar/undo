# Raw Reference

**Raw** endpoints, reached through `with_raw_response`, return `ApiResult[T, E]` and never raise for an API error. For the parsed endpoints, see [API Reference](api-reference.md).

> Source: [UndoApiClient](undo_api/client.py)

## MandateRequests

> Source: [MandateRequests](undo_api/apis/mandate_requests.py)

<details>
<summary><code>def act_on_mandate_request(request_id: UUID, body: MandateRequestAction | MandateRequestActionDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[MandateRequestActionResult, ActOnMandateRequestErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

- `answer`: answers the agent's open questions; the draft is re-read from the new text.
- `prepare`: the exact mandate this device's key must sign.
- `sign`: stores the signed mandate; it must match the request byte for byte (same words, limits and agent).

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.mandate_requests.with_raw_response.act_on_mandate_request(
    UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"), AnswerAction(action="answer", answers={"What size?": "M"})
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MandateRequestActionResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ActOnMandateRequestErrorBody
```

**Async**

```python
result = await async_client.mandate_requests.with_raw_response.act_on_mandate_request(
    UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"), AnswerAction(action="answer", answers={"What size?": "M"})
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MandateRequestActionResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ActOnMandateRequestErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>request_id</code> | <code>UUID</code> | Mandate request id. |
| <code>body</code> | <code>[MandateRequestAction](undo_api/models/unions/mandate_request_action.py) \| [MandateRequestActionDict](undo_api/models/unions/mandate_request_action.py)</code> | The shopper's answer, a request to prepare the mandate, or the signed mandate. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[MandateRequestActionResult](undo_api/models/unions/mandate_request_action_result.py), [ActOnMandateRequestErrorBody](undo_api/errors/act_on_mandate_request_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[MandateRequestActionResult](undo_api/models/unions/mandate_request_action_result.py)</code> -- Answered (new draft) or prepared (mandate and signing message).

**On `Failure`**: `error` is <code>[ActOnMandateRequestErrorBody](undo_api/errors/act_on_mandate_request_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400, 404, 409, 422 | <code>[Error](undo_api/models/error.py)</code> |
| 429 | <code>[RateLimited](undo_api/models/rate_limited.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def get_mandate_request(request_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[MandateRequest, GetMandateRequestErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The draft an outside agent asked the shopper to sign, who is asking, and whether it is signed yet.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.mandate_requests.with_raw_response.get_mandate_request(UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MandateRequest
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetMandateRequestErrorBody
```

**Async**

```python
result = await async_client.mandate_requests.with_raw_response.get_mandate_request(
    UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d")
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MandateRequest
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetMandateRequestErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>request_id</code> | <code>UUID</code> | Mandate request id. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[MandateRequest](undo_api/models/mandate_request.py), [GetMandateRequestErrorBody](undo_api/errors/get_mandate_request_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[MandateRequest](undo_api/models/mandate_request.py)</code> -- The request.

**On `Failure`**: `error` is <code>[GetMandateRequestErrorBody](undo_api/errors/get_mandate_request_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 404 | <code>[Error](undo_api/models/error.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Mandates

> Source: [Mandates](undo_api/apis/mandates.py)

<details>
<summary><code>def draft_mandate(body: DraftMandateRequest | DraftMandateRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[DraftResult, DraftMandateErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Turns a plain request into structured limits for the shopper to review. Nothing is stored. Rate limited per visitor.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.mandates.with_raw_response.draft_mandate(
    DraftMandateRequest(request="A black hoodie in size M under $80")
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type DraftResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type DraftMandateErrorBody
```

**Async**

```python
result = await async_client.mandates.with_raw_response.draft_mandate(
    DraftMandateRequest(request="A black hoodie in size M under $80")
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type DraftResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type DraftMandateErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[DraftMandateRequest](undo_api/models/draft_mandate_request.py) \| [DraftMandateRequestDict](undo_api/models/draft_mandate_request.py)</code> | The shopper's request in their own words. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[DraftResult](undo_api/models/draft_result.py), [DraftMandateErrorBody](undo_api/errors/draft_mandate_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[DraftResult](undo_api/models/draft_result.py)</code> -- The draft and whether it can be signed as is.

**On `Failure`**: `error` is <code>[DraftMandateErrorBody](undo_api/errors/draft_mandate_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400, 502, 503 | <code>[Error](undo_api/models/error.py)</code> |
| 429 | <code>[RateLimited](undo_api/models/rate_limited.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def get_mandate(mandate_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[MandateView, GetMandateErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The mandate, its status, the search it permits, and a fresh check of its digest, signature and event chain.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.mandates.with_raw_response.get_mandate(UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MandateView
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetMandateErrorBody
```

**Async**

```python
result = await async_client.mandates.with_raw_response.get_mandate(UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MandateView
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetMandateErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>mandate_id</code> | <code>UUID</code> | Mandate id. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[MandateView](undo_api/models/mandate_view.py), [GetMandateErrorBody](undo_api/errors/get_mandate_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[MandateView](undo_api/models/mandate_view.py)</code> -- The mandate with a live integrity check.

**On `Failure`**: `error` is <code>[GetMandateErrorBody](undo_api/errors/get_mandate_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 404 | <code>[Error](undo_api/models/error.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def prepare_mandate(body: PrepareMandate | PrepareMandateDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[PreparedMandate, PrepareMandateErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns the mandate the shopper's device must sign and the exact `signingMessage`
(`undo-intent-mandate-v1:<sha256 of the canonical mandate JSON>`). Stateless; nothing is stored.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.mandates.with_raw_response.prepare_mandate(
    PrepareMandate(
        request="A black hoodie in size M under $80",
        draft=IntentDraft(
            item="black hoodie",
            category="hoodie",
            quantity=1,
            max_price=80,
            currency="USD",
            attributes={"color": "black", "size": "M"},
            must_ask=[],
        ),
        shopper_key="aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type PreparedMandate
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type PrepareMandateErrorBody
```

**Async**

```python
result = await async_client.mandates.with_raw_response.prepare_mandate(
    PrepareMandate(
        request="A black hoodie in size M under $80",
        draft=IntentDraft(
            item="black hoodie",
            category="hoodie",
            quantity=1,
            max_price=80,
            currency="USD",
            attributes={"color": "black", "size": "M"},
            must_ask=[],
        ),
        shopper_key="aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type PreparedMandate
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type PrepareMandateErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[PrepareMandate](undo_api/models/prepare_mandate.py) \| [PrepareMandateDict](undo_api/models/prepare_mandate.py)</code> | The draft, the shopper's words and the device key that will sign. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[PreparedMandate](undo_api/models/prepared_mandate.py), [PrepareMandateErrorBody](undo_api/errors/prepare_mandate_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[PreparedMandate](undo_api/models/prepared_mandate.py)</code> -- The mandate and the string to sign.

**On `Failure`**: `error` is <code>[PrepareMandateErrorBody](undo_api/errors/prepare_mandate_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400 | <code>[Error](undo_api/models/error.py)</code> |
| 422 | <code>[NotReady](undo_api/models/not_ready.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def store_mandate(body: SignedMandate | SignedMandateDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[StoredMandate, StoreMandateErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Re-verifies the signature, freshness, expiry and readiness, then writes the first event of the mandate's hash chain.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.mandates.with_raw_response.store_mandate(
    SignedMandate(
        mandate=IntentMandate(
            version=1,
            id=UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"),
            created_at=datetime(2026, 10, 20, 4, 18, 17, 928000, tzinfo=timezone.utc),
            expires_at=datetime(2026, 11, 3, 4, 18, 17, 928000, tzinfo=timezone.utc),
            shopper_key="aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
            request="Buy me black men's running shoes, size 10, under $120",
            intent=IntentDraft(
                item="running shoes",
                category="running shoes",
                quantity=1,
                max_price=120,
                currency="USD",
                attributes={"size": "10", "color": "black"},
                gender=Gender.MALE,
                must_ask=[],
            ),
        ),
        signature="derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type StoredMandate
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type StoreMandateErrorBody
```

**Async**

```python
result = await async_client.mandates.with_raw_response.store_mandate(
    SignedMandate(
        mandate=IntentMandate(
            version=1,
            id=UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"),
            created_at=datetime(2026, 10, 20, 4, 18, 17, 928000, tzinfo=timezone.utc),
            expires_at=datetime(2026, 11, 3, 4, 18, 17, 928000, tzinfo=timezone.utc),
            shopper_key="aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
            request="Buy me black men's running shoes, size 10, under $120",
            intent=IntentDraft(
                item="running shoes",
                category="running shoes",
                quantity=1,
                max_price=120,
                currency="USD",
                attributes={"size": "10", "color": "black"},
                gender=Gender.MALE,
                must_ask=[],
            ),
        ),
        signature="derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type StoredMandate
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type StoreMandateErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[SignedMandate](undo_api/models/signed_mandate.py) \| [SignedMandateDict](undo_api/models/signed_mandate.py)</code> | The mandate and the shopper's signature over it. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[StoredMandate](undo_api/models/stored_mandate.py), [StoreMandateErrorBody](undo_api/errors/store_mandate_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[StoredMandate](undo_api/models/stored_mandate.py)</code> -- Stored.

**On `Failure`**: `error` is <code>[StoreMandateErrorBody](undo_api/errors/store_mandate_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400, 403, 409, 422 | <code>[Error](undo_api/models/error.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Merchant

> Source: [Merchant](undo_api/apis/merchant.py)

<details>
<summary><code>def get_merchant_rules(*, request_options: RequestOptionsOrDict | None = None) -> ApiResult[MerchantRules, RawError]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The rules the store applies to agents at checkout: block below a trust score, lengthen the undo window below a score, or accept only registered operators.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.merchant.with_raw_response.get_merchant_rules()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MerchantRules
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

**Async**

```python
result = await async_client.merchant.with_raw_response.get_merchant_rules()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MerchantRules
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[MerchantRules](undo_api/models/merchant_rules.py), [RawError](undo_api/core/results.py)&#93;</code>

**On `Success`**: `payload` is <code>[MerchantRules](undo_api/models/merchant_rules.py)</code> -- The rules.

**On `Failure`**: `error` is <code>[RawError](undo_api/core/results.py)</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def list_merchant_activity(*, after: int | None = None, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ActivityFeed, RawError]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Every step Undo records, newest first (up to 60). Pass `after` to get only events newer than that id.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.merchant.with_raw_response.list_merchant_activity(after=1200)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActivityFeed
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

**Async**

```python
result = await async_client.merchant.with_raw_response.list_merchant_activity(after=1200)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActivityFeed
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>after</code> | <code>int \| None</code> | Only events with an id greater than this.<br>**Default**: <code>None</code> |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[ActivityFeed](undo_api/models/activity_feed.py), [RawError](undo_api/core/results.py)&#93;</code>

**On `Success`**: `payload` is <code>[ActivityFeed](undo_api/models/activity_feed.py)</code> -- Activity events.

**On `Failure`**: `error` is <code>[RawError](undo_api/core/results.py)</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def list_merchant_agents(*, request_options: RequestOptionsOrDict | None = None) -> ApiResult[MerchantAgents, RawError]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Every agent that has shopped here, its record and trust score with every point explained, and what the store's rules do to it.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.merchant.with_raw_response.list_merchant_agents()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MerchantAgents
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

**Async**

```python
result = await async_client.merchant.with_raw_response.list_merchant_agents()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MerchantAgents
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[MerchantAgents](undo_api/models/merchant_agents.py), [RawError](undo_api/core/results.py)&#93;</code>

**On `Success`**: `payload` is <code>[MerchantAgents](undo_api/models/merchant_agents.py)</code> -- Agents and the store's rules.

**On `Failure`**: `error` is <code>[RawError](undo_api/core/results.py)</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def list_merchant_orders(*, request_options: RequestOptionsOrDict | None = None) -> ApiResult[MerchantOrders, RawError]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Every agent order (latest 300) with its verdict, who pays and any agent payout, plus headline numbers.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.merchant.with_raw_response.list_merchant_orders()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MerchantOrders
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

**Async**

```python
result = await async_client.merchant.with_raw_response.list_merchant_orders()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MerchantOrders
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[MerchantOrders](undo_api/models/merchant_orders.py), [RawError](undo_api/core/results.py)&#93;</code>

**On `Success`**: `payload` is <code>[MerchantOrders](undo_api/models/merchant_orders.py)</code> -- Orders and KPIs.

**On `Failure`**: `error` is <code>[RawError](undo_api/core/results.py)</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def resolve_order(order_id: UUID, body: ResolveOrderRequest | ResolveOrderRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ResolveOrderResult, ResolveOrderErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The merchant's side of an Undo. Sandbox only.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.merchant.with_raw_response.resolve_order(
    UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"), ResolveOrderRequest(action=ResolveAction.RETRY_SETTLEMENT)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ResolveOrderResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ResolveOrderErrorBody
```

**Async**

```python
result = await async_client.merchant.with_raw_response.resolve_order(
    UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"), ResolveOrderRequest(action=ResolveAction.RETRY_SETTLEMENT)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ResolveOrderResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ResolveOrderErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>order_id</code> | <code>UUID</code> | Undo order id. |
| <code>body</code> | <code>[ResolveOrderRequest](undo_api/models/resolve_order_request.py) \| [ResolveOrderRequestDict](undo_api/models/resolve_order_request.py)</code> | The merchant's decision. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[ResolveOrderResult](undo_api/models/resolve_order_result.py), [ResolveOrderErrorBody](undo_api/errors/resolve_order_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ResolveOrderResult](undo_api/models/resolve_order_result.py)</code> -- Done; the body describes the PayPal actions taken.

**On `Failure`**: `error` is <code>[ResolveOrderErrorBody](undo_api/errors/resolve_order_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400, 403, 404, 409, 502 | <code>[Error](undo_api/models/error.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def update_merchant_rules(body: MerchantRules | MerchantRulesDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[MerchantRules, UpdateMerchantRulesErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Applies from the next checkout, for Undo's agent and every MCP agent. Each change is recorded in the store's event chain.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.merchant.with_raw_response.update_merchant_rules(
    MerchantRules(block_below=1, extend_below=50, extend_minutes=360, block_unverified=False)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MerchantRules
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type UpdateMerchantRulesErrorBody
```

**Async**

```python
result = await async_client.merchant.with_raw_response.update_merchant_rules(
    MerchantRules(block_below=1, extend_below=50, extend_minutes=360, block_unverified=False)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type MerchantRules
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type UpdateMerchantRulesErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[MerchantRules](undo_api/models/merchant_rules.py) \| [MerchantRulesDict](undo_api/models/merchant_rules.py)</code> | The rules to apply from the next checkout. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[MerchantRules](undo_api/models/merchant_rules.py), [UpdateMerchantRulesErrorBody](undo_api/errors/update_merchant_rules_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[MerchantRules](undo_api/models/merchant_rules.py)</code> -- The rules now in force.

**On `Failure`**: `error` is <code>[UpdateMerchantRulesErrorBody](undo_api/errors/update_merchant_rules_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400 | <code>[Error](undo_api/models/error.py)</code> |
| 429 | <code>[RateLimited](undo_api/models/rate_limited.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Orders

> Source: [Orders](undo_api/apis/orders.py)

<details>
<summary><code>def get_order(order_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[OrderView, GetOrderErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The purchase, the live undo window, the mandate behind it, and its verified event chain. Each event carries its proof.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.orders.with_raw_response.get_order(UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type OrderView
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetOrderErrorBody
```

**Async**

```python
result = await async_client.orders.with_raw_response.get_order(UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type OrderView
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetOrderErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>order_id</code> | <code>UUID</code> | Undo order id. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[OrderView](undo_api/models/order_view.py), [GetOrderErrorBody](undo_api/errors/get_order_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[OrderView](undo_api/models/order_view.py)</code> -- The order.

**On `Failure`**: `error` is <code>[GetOrderErrorBody](undo_api/errors/get_order_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 404 | <code>[Error](undo_api/models/error.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def get_order_evidence(order_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[Evidence, GetOrderEvidenceErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Everything needed to check an order without trusting Undo: the raw hash-chained events exactly as hashed and
the signed mandate exactly as stored. Nothing is pre-verified, on purpose.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.orders.with_raw_response.get_order_evidence(UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Evidence
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetOrderEvidenceErrorBody
```

**Async**

```python
result = await async_client.orders.with_raw_response.get_order_evidence(UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Evidence
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetOrderEvidenceErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>order_id</code> | <code>UUID</code> | Undo order id. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[Evidence](undo_api/models/evidence.py), [GetOrderEvidenceErrorBody](undo_api/errors/get_order_evidence_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[Evidence](undo_api/models/evidence.py)</code> -- The evidence file (`undo-evidence-v1`).

**On `Failure`**: `error` is <code>[GetOrderEvidenceErrorBody](undo_api/errors/get_order_evidence_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 404 | <code>[Error](undo_api/models/error.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def undo_order(order_id: UUID, body: UndoRequest | UndoRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[UndoResult, UndoOrderErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The Undo button. Must be signed by the mandate's shopper key over
`undo-request-v1:<orderId>:<sha256 hex of reason>:<sha256 hex of photo bytes, or ->:<requestedAt>`.
`requestedAt` must be within 15 minutes of now. Runs the fault check, then routes the money: a void inside
the window, or a refund, merchant claim, return or human review after capture. Rate limited per visitor.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.orders.with_raw_response.undo_order(
    UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
    UndoRequest(
        reason="This isn't what I asked for.",
        requested_at=datetime(2026, 10, 20, 16, 30, 0, tzinfo=timezone.utc),
        signature="derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type UndoResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type UndoOrderErrorBody
```

**Async**

```python
result = await async_client.orders.with_raw_response.undo_order(
    UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
    UndoRequest(
        reason="This isn't what I asked for.",
        requested_at=datetime(2026, 10, 20, 16, 30, 0, tzinfo=timezone.utc),
        signature="derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type UndoResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type UndoOrderErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>order_id</code> | <code>UUID</code> | Undo order id. |
| <code>body</code> | <code>[UndoRequest](undo_api/models/undo_request.py) \| [UndoRequestDict](undo_api/models/undo_request.py)</code> | Why the shopper is undoing, an optional photo, and their signature. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[UndoResult](undo_api/models/undo_result.py), [UndoOrderErrorBody](undo_api/errors/undo_order_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[UndoResult](undo_api/models/undo_result.py)</code> -- The verdict and what happened to the money.

**On `Failure`**: `error` is <code>[UndoOrderErrorBody](undo_api/errors/undo_order_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400, 403, 404, 409, 413, 422, 502 | <code>[Error](undo_api/models/error.py)</code> |
| 429 | <code>[RateLimited](undo_api/models/rate_limited.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Products

> Source: [Products](undo_api/apis/products.py)

<details>
<summary><code>def get_product(product_id: str, *, options: dict[str, str] | None = None, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ProductDetail, GetProductErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Fresh product detail resolved to the requested variant. Pass options as `option_<Name>=<value>` query
parameters, for example `option_Size=M&option_Color=Black`. `relaxed` lists any option the catalog could not honor.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.products.with_raw_response.get_product(
    "w25336I", options={"option_Size": "10.5", "option_Color": "Black"}
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ProductDetail
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetProductErrorBody
```

**Async**

```python
result = await async_client.products.with_raw_response.get_product(
    "w25336I", options={"option_Size": "10.5", "option_Color": "Black"}
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ProductDetail
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetProductErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>product_id</code> | <code>str</code> | Catalog product id (`channel3Id` from a search). |
| <code>options</code> | <code>dict&#91;str, str&#93; \| None</code> | Variant options as `option_<Name>` keys.<br>**Default**: <code>None</code> |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[ProductDetail](undo_api/models/product_detail.py), [GetProductErrorBody](undo_api/errors/get_product_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ProductDetail](undo_api/models/product_detail.py)</code> -- The product at the closest available variant.

**On `Failure`**: `error` is <code>[GetProductErrorBody](undo_api/errors/get_product_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 404, 502 | <code>[Error](undo_api/models/error.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def search_products(body: ProductSearch | ProductSearchDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ProductSearchResult, SearchProductsErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Searches the live catalog with structured filters. Rate limited per visitor.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.products.with_raw_response.search_products(
    ProductSearch(query="black hoodie", max_price=80, color="black", limit=5)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ProductSearchResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type SearchProductsErrorBody
```

**Async**

```python
result = await async_client.products.with_raw_response.search_products(
    ProductSearch(query="black hoodie", max_price=80, color="black", limit=5)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ProductSearchResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type SearchProductsErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[ProductSearch](undo_api/models/product_search.py) \| [ProductSearchDict](undo_api/models/product_search.py)</code> | What to search for and how to filter it. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[ProductSearchResult](undo_api/models/product_search_result.py), [SearchProductsErrorBody](undo_api/errors/search_products_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ProductSearchResult](undo_api/models/product_search_result.py)</code> -- Matching products with an offer.

**On `Failure`**: `error` is <code>[SearchProductsErrorBody](undo_api/errors/search_products_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400, 502 | <code>[Error](undo_api/models/error.py)</code> |
| 429 | <code>[RateLimited](undo_api/models/rate_limited.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Service

> Source: [Service](undo_api/apis/service.py)

<details>
<summary><code>def get_health(*, deep: str | None = None, request_options: RequestOptionsOrDict | None = None) -> ApiResult[Health, GetHealthErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Shallow health check. With `deep`, also proves the service can reach PayPal sandbox and the database. Never returns secret values.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.service.with_raw_response.get_health(deep="1")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Health
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetHealthErrorBody
```

**Async**

```python
result = await async_client.service.with_raw_response.get_health(deep="1")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Health
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetHealthErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>deep</code> | <code>str \| None</code> | Present (any value) to also check PayPal and the database.<br>**Default**: <code>None</code> |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[Health](undo_api/models/health.py), [GetHealthErrorBody](undo_api/errors/get_health_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[Health](undo_api/models/health.py)</code> -- Healthy.

**On `Failure`**: `error` is <code>[GetHealthErrorBody](undo_api/errors/get_health_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 503 | <code>[Health](undo_api/models/health.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Shopping

> Source: [Shopping](undo_api/apis/shopping.py)

<details>
<summary><code>def shop_mandate(mandate_id: UUID, *, body: ShopMandateRequest | ShopMandateRequestDict | None = None, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ShopResult, ShopMandateErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Undo's agent searches, checks the cart against the signed limits, and opens a PayPal checkout in AUTHORIZE
mode. Without a saved wallet the shopper approves at `approveUrl`; with one (and only if the mandate allows it)
the money is held straight away. One live purchase per mandate. Rate limited per visitor.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.shopping.with_raw_response.shop_mandate(
    UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"), body=ShopMandateRequest()
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ShopResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ShopMandateErrorBody
```

**Async**

```python
result = await async_client.shopping.with_raw_response.shop_mandate(
    UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"), body=ShopMandateRequest()
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ShopResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ShopMandateErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>mandate_id</code> | <code>UUID</code> | Mandate id. |
| <code>body</code> | <code>[ShopMandateRequest](undo_api/models/shop_mandate_request.py) \| [ShopMandateRequestDict](undo_api/models/shop_mandate_request.py) \| None</code> | Optional demo settings. Send {} for a normal run.<br>**Default**: <code>None</code> |
| <code>request_options</code> | <code>[RequestOptionsOrDict](undo_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](undo_api/core/results.py)&#91;[ShopResult](undo_api/models/shop_result.py), [ShopMandateErrorBody](undo_api/errors/shop_mandate_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ShopResult](undo_api/models/shop_result.py)</code> -- Checkout opened.

**On `Failure`**: `error` is <code>[ShopMandateErrorBody](undo_api/errors/shop_mandate_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 403, 404, 409, 422, 502, 503 | <code>[Error](undo_api/models/error.py)</code> |
| 429 | <code>[RateLimited](undo_api/models/rate_limited.py)</code> |
| anything unmapped | <code>[RawError](undo_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

