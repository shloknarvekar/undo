# Reference

**Parsed** endpoints return the typed payload and raise `ApiError` on a documented non-2xx. For the raw endpoints, see [Raw API Reference](raw-api-reference.md).

> Source: [UndoApiClient](undo_api/client.py)

## MandateRequests

> Source: [MandateRequests](undo_api/apis/mandate_requests.py)

<details>
<summary><code>def act_on_mandate_request(request_id: UUID, body: MandateRequestAction | MandateRequestActionDict, *, request_options: RequestOptionsOrDict | None = None) -> MandateRequestActionResult</code></summary>

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
try:
    response = client.mandate_requests.act_on_mandate_request(
        UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"), AnswerAction(action="answer", answers={"What size?": "M"})
    )
    # TODO: Handle 'response' of type MandateRequestActionResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ActOnMandateRequestErrorBody
```

**Async**

```python
try:
    response = await async_client.mandate_requests.act_on_mandate_request(
        UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"), AnswerAction(action="answer", answers={"What size?": "M"})
    )
    # TODO: Handle 'response' of type MandateRequestActionResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ActOnMandateRequestErrorBody
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

**OnSuccess**: <code>[MandateRequestActionResult](undo_api/models/unions/mandate_request_action_result.py)</code> -- Answered (new draft) or prepared (mandate and signing message).

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[ActOnMandateRequestErrorBody](undo_api/errors/act_on_mandate_request_error.py)&#93;</code>

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
<summary><code>def get_mandate_request(request_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> MandateRequest</code></summary>

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
try:
    response = client.mandate_requests.get_mandate_request(UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"))
    # TODO: Handle 'response' of type MandateRequest
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetMandateRequestErrorBody
```

**Async**

```python
try:
    response = await async_client.mandate_requests.get_mandate_request(UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"))
    # TODO: Handle 'response' of type MandateRequest
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetMandateRequestErrorBody
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

**OnSuccess**: <code>[MandateRequest](undo_api/models/mandate_request.py)</code> -- The request.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[GetMandateRequestErrorBody](undo_api/errors/get_mandate_request_error.py)&#93;</code>

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
<summary><code>def draft_mandate(body: DraftMandateRequest | DraftMandateRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> DraftResult</code></summary>

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
try:
    response = client.mandates.draft_mandate(DraftMandateRequest(request="A black hoodie in size M under $80"))
    # TODO: Handle 'response' of type DraftResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type DraftMandateErrorBody
```

**Async**

```python
try:
    response = await async_client.mandates.draft_mandate(
        DraftMandateRequest(request="A black hoodie in size M under $80")
    )
    # TODO: Handle 'response' of type DraftResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type DraftMandateErrorBody
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

**OnSuccess**: <code>[DraftResult](undo_api/models/draft_result.py)</code> -- The draft and whether it can be signed as is.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[DraftMandateErrorBody](undo_api/errors/draft_mandate_error.py)&#93;</code>

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
<summary><code>def get_mandate(mandate_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> MandateView</code></summary>

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
try:
    response = client.mandates.get_mandate(UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"))
    # TODO: Handle 'response' of type MandateView
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetMandateErrorBody
```

**Async**

```python
try:
    response = await async_client.mandates.get_mandate(UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"))
    # TODO: Handle 'response' of type MandateView
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetMandateErrorBody
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

**OnSuccess**: <code>[MandateView](undo_api/models/mandate_view.py)</code> -- The mandate with a live integrity check.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[GetMandateErrorBody](undo_api/errors/get_mandate_error.py)&#93;</code>

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
<summary><code>def prepare_mandate(body: PrepareMandate | PrepareMandateDict, *, request_options: RequestOptionsOrDict | None = None) -> PreparedMandate</code></summary>

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
try:
    response = client.mandates.prepare_mandate(
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
    # TODO: Handle 'response' of type PreparedMandate
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type PrepareMandateErrorBody
```

**Async**

```python
try:
    response = await async_client.mandates.prepare_mandate(
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
    # TODO: Handle 'response' of type PreparedMandate
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type PrepareMandateErrorBody
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

**OnSuccess**: <code>[PreparedMandate](undo_api/models/prepared_mandate.py)</code> -- The mandate and the string to sign.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[PrepareMandateErrorBody](undo_api/errors/prepare_mandate_error.py)&#93;</code>

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
<summary><code>def store_mandate(body: SignedMandate | SignedMandateDict, *, request_options: RequestOptionsOrDict | None = None) -> StoredMandate</code></summary>

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
try:
    response = client.mandates.store_mandate(
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
    # TODO: Handle 'response' of type StoredMandate
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type StoreMandateErrorBody
```

**Async**

```python
try:
    response = await async_client.mandates.store_mandate(
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
    # TODO: Handle 'response' of type StoredMandate
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type StoreMandateErrorBody
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

**OnSuccess**: <code>[StoredMandate](undo_api/models/stored_mandate.py)</code> -- Stored.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[StoreMandateErrorBody](undo_api/errors/store_mandate_error.py)&#93;</code>

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
<summary><code>def get_merchant_rules(*, request_options: RequestOptionsOrDict | None = None) -> MerchantRules</code></summary>

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
try:
    response = client.merchant.get_merchant_rules()
    # TODO: Handle 'response' of type MerchantRules
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
```

**Async**

```python
try:
    response = await async_client.merchant.get_merchant_rules()
    # TODO: Handle 'response' of type MerchantRules
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
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

**OnSuccess**: <code>[MerchantRules](undo_api/models/merchant_rules.py)</code> -- The rules.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[RawError](undo_api/core/results.py)&#93;</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def list_merchant_activity(*, after: int | None = None, request_options: RequestOptionsOrDict | None = None) -> ActivityFeed</code></summary>

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
try:
    response = client.merchant.list_merchant_activity(after=1200)
    # TODO: Handle 'response' of type ActivityFeed
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
```

**Async**

```python
try:
    response = await async_client.merchant.list_merchant_activity(after=1200)
    # TODO: Handle 'response' of type ActivityFeed
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
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

**OnSuccess**: <code>[ActivityFeed](undo_api/models/activity_feed.py)</code> -- Activity events.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[RawError](undo_api/core/results.py)&#93;</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def list_merchant_agents(*, request_options: RequestOptionsOrDict | None = None) -> MerchantAgents</code></summary>

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
try:
    response = client.merchant.list_merchant_agents()
    # TODO: Handle 'response' of type MerchantAgents
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
```

**Async**

```python
try:
    response = await async_client.merchant.list_merchant_agents()
    # TODO: Handle 'response' of type MerchantAgents
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
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

**OnSuccess**: <code>[MerchantAgents](undo_api/models/merchant_agents.py)</code> -- Agents and the store's rules.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[RawError](undo_api/core/results.py)&#93;</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def list_merchant_orders(*, request_options: RequestOptionsOrDict | None = None) -> MerchantOrders</code></summary>

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
try:
    response = client.merchant.list_merchant_orders()
    # TODO: Handle 'response' of type MerchantOrders
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
```

**Async**

```python
try:
    response = await async_client.merchant.list_merchant_orders()
    # TODO: Handle 'response' of type MerchantOrders
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
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

**OnSuccess**: <code>[MerchantOrders](undo_api/models/merchant_orders.py)</code> -- Orders and KPIs.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[RawError](undo_api/core/results.py)&#93;</code>

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def resolve_order(order_id: UUID, body: ResolveOrderRequest | ResolveOrderRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> ResolveOrderResult</code></summary>

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
try:
    response = client.merchant.resolve_order(
        UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"), ResolveOrderRequest(action=ResolveAction.RETRY_SETTLEMENT)
    )
    # TODO: Handle 'response' of type ResolveOrderResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ResolveOrderErrorBody
```

**Async**

```python
try:
    response = await async_client.merchant.resolve_order(
        UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"), ResolveOrderRequest(action=ResolveAction.RETRY_SETTLEMENT)
    )
    # TODO: Handle 'response' of type ResolveOrderResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ResolveOrderErrorBody
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

**OnSuccess**: <code>[ResolveOrderResult](undo_api/models/resolve_order_result.py)</code> -- Done; the body describes the PayPal actions taken.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[ResolveOrderErrorBody](undo_api/errors/resolve_order_error.py)&#93;</code>

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
<summary><code>def update_merchant_rules(body: MerchantRules | MerchantRulesDict, *, request_options: RequestOptionsOrDict | None = None) -> MerchantRules</code></summary>

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
try:
    response = client.merchant.update_merchant_rules(
        MerchantRules(block_below=1, extend_below=50, extend_minutes=360, block_unverified=False)
    )
    # TODO: Handle 'response' of type MerchantRules
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type UpdateMerchantRulesErrorBody
```

**Async**

```python
try:
    response = await async_client.merchant.update_merchant_rules(
        MerchantRules(block_below=1, extend_below=50, extend_minutes=360, block_unverified=False)
    )
    # TODO: Handle 'response' of type MerchantRules
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type UpdateMerchantRulesErrorBody
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

**OnSuccess**: <code>[MerchantRules](undo_api/models/merchant_rules.py)</code> -- The rules now in force.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[UpdateMerchantRulesErrorBody](undo_api/errors/update_merchant_rules_error.py)&#93;</code>

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
<summary><code>def get_order(order_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> OrderView</code></summary>

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
try:
    response = client.orders.get_order(UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"))
    # TODO: Handle 'response' of type OrderView
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetOrderErrorBody
```

**Async**

```python
try:
    response = await async_client.orders.get_order(UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"))
    # TODO: Handle 'response' of type OrderView
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetOrderErrorBody
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

**OnSuccess**: <code>[OrderView](undo_api/models/order_view.py)</code> -- The order.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[GetOrderErrorBody](undo_api/errors/get_order_error.py)&#93;</code>

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
<summary><code>def get_order_evidence(order_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> Evidence</code></summary>

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
try:
    response = client.orders.get_order_evidence(UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"))
    # TODO: Handle 'response' of type Evidence
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetOrderEvidenceErrorBody
```

**Async**

```python
try:
    response = await async_client.orders.get_order_evidence(UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"))
    # TODO: Handle 'response' of type Evidence
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetOrderEvidenceErrorBody
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

**OnSuccess**: <code>[Evidence](undo_api/models/evidence.py)</code> -- The evidence file (`undo-evidence-v1`).

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[GetOrderEvidenceErrorBody](undo_api/errors/get_order_evidence_error.py)&#93;</code>

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
<summary><code>def undo_order(order_id: UUID, body: UndoRequest | UndoRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> UndoResult</code></summary>

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
try:
    response = client.orders.undo_order(
        UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
        UndoRequest(
            reason="This isn't what I asked for.",
            requested_at=datetime(2026, 10, 20, 16, 30, 0, tzinfo=timezone.utc),
            signature="derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
        ),
    )
    # TODO: Handle 'response' of type UndoResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type UndoOrderErrorBody
```

**Async**

```python
try:
    response = await async_client.orders.undo_order(
        UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
        UndoRequest(
            reason="This isn't what I asked for.",
            requested_at=datetime(2026, 10, 20, 16, 30, 0, tzinfo=timezone.utc),
            signature="derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
        ),
    )
    # TODO: Handle 'response' of type UndoResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type UndoOrderErrorBody
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

**OnSuccess**: <code>[UndoResult](undo_api/models/undo_result.py)</code> -- The verdict and what happened to the money.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[UndoOrderErrorBody](undo_api/errors/undo_order_error.py)&#93;</code>

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
<summary><code>def get_product(product_id: str, *, options: dict[str, str] | None = None, request_options: RequestOptionsOrDict | None = None) -> ProductDetail</code></summary>

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
try:
    response = client.products.get_product("w25336I", options={"option_Size": "10.5", "option_Color": "Black"})
    # TODO: Handle 'response' of type ProductDetail
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetProductErrorBody
```

**Async**

```python
try:
    response = await async_client.products.get_product(
        "w25336I", options={"option_Size": "10.5", "option_Color": "Black"}
    )
    # TODO: Handle 'response' of type ProductDetail
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetProductErrorBody
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

**OnSuccess**: <code>[ProductDetail](undo_api/models/product_detail.py)</code> -- The product at the closest available variant.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[GetProductErrorBody](undo_api/errors/get_product_error.py)&#93;</code>

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
<summary><code>def search_products(body: ProductSearch | ProductSearchDict, *, request_options: RequestOptionsOrDict | None = None) -> ProductSearchResult</code></summary>

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
try:
    response = client.products.search_products(
        ProductSearch(query="black hoodie", max_price=80, color="black", limit=5)
    )
    # TODO: Handle 'response' of type ProductSearchResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type SearchProductsErrorBody
```

**Async**

```python
try:
    response = await async_client.products.search_products(
        ProductSearch(query="black hoodie", max_price=80, color="black", limit=5)
    )
    # TODO: Handle 'response' of type ProductSearchResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type SearchProductsErrorBody
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

**OnSuccess**: <code>[ProductSearchResult](undo_api/models/product_search_result.py)</code> -- Matching products with an offer.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[SearchProductsErrorBody](undo_api/errors/search_products_error.py)&#93;</code>

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
<summary><code>def get_health(*, deep: str | None = None, request_options: RequestOptionsOrDict | None = None) -> Health</code></summary>

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
try:
    response = client.service.get_health(deep="1")
    # TODO: Handle 'response' of type Health
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetHealthErrorBody
```

**Async**

```python
try:
    response = await async_client.service.get_health(deep="1")
    # TODO: Handle 'response' of type Health
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetHealthErrorBody
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

**OnSuccess**: <code>[Health](undo_api/models/health.py)</code> -- Healthy.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[GetHealthErrorBody](undo_api/errors/get_health_error.py)&#93;</code>

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
<summary><code>def shop_mandate(mandate_id: UUID, *, body: ShopMandateRequest | ShopMandateRequestDict | None = None, request_options: RequestOptionsOrDict | None = None) -> ShopResult</code></summary>

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
try:
    response = client.shopping.shop_mandate(UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"), body=ShopMandateRequest())
    # TODO: Handle 'response' of type ShopResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ShopMandateErrorBody
```

**Async**

```python
try:
    response = await async_client.shopping.shop_mandate(
        UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"), body=ShopMandateRequest()
    )
    # TODO: Handle 'response' of type ShopResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ShopMandateErrorBody
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

**OnSuccess**: <code>[ShopResult](undo_api/models/shop_result.py)</code> -- Checkout opened.

**OnError**: <code>[ApiError](undo_api/core/exceptions.py)&#91;[ShopMandateErrorBody](undo_api/errors/shop_mandate_error.py)&#93;</code>

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

