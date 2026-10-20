# Reference

> Source: [UndoApiClient](src/client.ts)

## Products

> Source: [Products](src/resources/products.ts)

<details>
<summary><code>getProduct(request: Products.GetProductRequest, options?: RequestOptions): ApiPromise&lt;ProductDetail, Products.GetProductError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Fresh product detail resolved to the requested variant. Pass options as `option_<Name>=<value>` query
parameters, for example `option_Size=M&option_Color=Black`. `relaxed` lists any option the catalog could not honor.


</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.products.getProduct({
    productId: "w25336I",
    options: { option_Size: "10.5", option_Color: "Black" },
  });
  // TODO: Handle 'response' of type ProductDetail
} catch (err) {
  // TODO: Handle 'err' of type Products.GetProductError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.products.getProduct({
  productId: "w25336I",
  options: { option_Size: "10.5", option_Color: "Black" },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ProductDetail
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>productId</code> | <code>string</code> | Catalog product id (`channel3Id` from a search). |
| <code>options?</code> | <code>Record&lt;string, string&gt;</code> | Variant options as `option_<Name>` keys. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.products.getProduct(request)`

- **OnSuccess**: <code>[ProductDetail](src/models/product-detail.ts)</code>
- **OnError**: throws <code>[Products.GetProductError](src/resources/products.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.products.getProduct(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ProductDetail, Products.GetProductError&gt;</code>, with `result.value` of type <code>[ProductDetail](src/models/product-detail.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>searchProducts(request: Products.SearchProductsRequest, options?: RequestOptions): ApiPromise&lt;ProductSearchResult, Products.SearchProductsError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Searches the live catalog with structured filters. Rate limited per visitor.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.products.searchProducts({
    body: { query: "black hoodie", maxPrice: 80, color: "black", limit: 5 },
  });
  // TODO: Handle 'response' of type ProductSearchResult
} catch (err) {
  // TODO: Handle 'err' of type Products.SearchProductsError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.products.searchProducts({
  body: { query: "black hoodie", maxPrice: 80, color: "black", limit: 5 },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ProductSearchResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[ProductSearch](src/models/product-search.ts)</code> | What to search for and how to filter it. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.products.searchProducts(request)`

- **OnSuccess**: <code>[ProductSearchResult](src/models/product-search-result.ts)</code>
- **OnError**: throws <code>[Products.SearchProductsError](src/resources/products.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.products.searchProducts(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ProductSearchResult, Products.SearchProductsError&gt;</code>, with `result.value` of type <code>[ProductSearchResult](src/models/product-search-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Mandates

> Source: [Mandates](src/resources/mandates.ts)

<details>
<summary><code>draftMandate(request: Mandates.DraftMandateRequestParams, options?: RequestOptions): ApiPromise&lt;DraftResult, Mandates.DraftMandateError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Turns a plain request into structured limits for the shopper to review. Nothing is stored. Rate limited per visitor.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.mandates.draftMandate({
    body: { request: "A black hoodie in size M under $80" },
  });
  // TODO: Handle 'response' of type DraftResult
} catch (err) {
  // TODO: Handle 'err' of type Mandates.DraftMandateError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.mandates.draftMandate({
  body: { request: "A black hoodie in size M under $80" },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type DraftResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[DraftMandateRequest](src/models/draft-mandate-request.ts)</code> | The shopper's request in their own words. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.mandates.draftMandate(request)`

- **OnSuccess**: <code>[DraftResult](src/models/draft-result.ts)</code>
- **OnError**: throws <code>[Mandates.DraftMandateError](src/resources/mandates.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.mandates.draftMandate(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;DraftResult, Mandates.DraftMandateError&gt;</code>, with `result.value` of type <code>[DraftResult](src/models/draft-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>getMandate(request: Mandates.GetMandateRequest, options?: RequestOptions): ApiPromise&lt;MandateView, Mandates.GetMandateError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The mandate, its status, the search it permits, and a fresh check of its digest, signature and event chain.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.mandates.getMandate({ mandateId: "2f4069f0-2367-4f08-acc6-d9cf1cf6669a" });
  // TODO: Handle 'response' of type MandateView
} catch (err) {
  // TODO: Handle 'err' of type Mandates.GetMandateError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.mandates.getMandate({
  mandateId: "2f4069f0-2367-4f08-acc6-d9cf1cf6669a",
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type MandateView
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>mandateId</code> | <code>string</code> | Mandate id. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.mandates.getMandate(request)`

- **OnSuccess**: <code>[MandateView](src/models/mandate-view.ts)</code>
- **OnError**: throws <code>[Mandates.GetMandateError](src/resources/mandates.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.mandates.getMandate(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;MandateView, Mandates.GetMandateError&gt;</code>, with `result.value` of type <code>[MandateView](src/models/mandate-view.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>prepareMandate(request: Mandates.PrepareMandateRequest, options?: RequestOptions): ApiPromise&lt;PreparedMandate, Mandates.PrepareMandateError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns the mandate the shopper's device must sign and the exact `signingMessage`
(`undo-intent-mandate-v1:<sha256 of the canonical mandate JSON>`). Stateless; nothing is stored.


</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.mandates.prepareMandate({
    body: {
      request: "A black hoodie in size M under $80",
      draft: {
        item: "black hoodie",
        category: "hoodie",
        quantity: 1,
        maxPrice: 80,
        currency: "USD",
        attributes: { color: "black", size: "M" },
        mustAsk: [],
      },
      shopperKey: "aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
    },
  });
  // TODO: Handle 'response' of type PreparedMandate
} catch (err) {
  // TODO: Handle 'err' of type Mandates.PrepareMandateError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.mandates.prepareMandate({
  body: {
    request: "A black hoodie in size M under $80",
    draft: {
      item: "black hoodie",
      category: "hoodie",
      quantity: 1,
      maxPrice: 80,
      currency: "USD",
      attributes: { color: "black", size: "M" },
      mustAsk: [],
    },
    shopperKey: "aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
  },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type PreparedMandate
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[PrepareMandate](src/models/prepare-mandate.ts)</code> | The draft, the shopper's words and the device key that will sign. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.mandates.prepareMandate(request)`

- **OnSuccess**: <code>[PreparedMandate](src/models/prepared-mandate.ts)</code>
- **OnError**: throws <code>[Mandates.PrepareMandateError](src/resources/mandates.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.mandates.prepareMandate(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;PreparedMandate, Mandates.PrepareMandateError&gt;</code>, with `result.value` of type <code>[PreparedMandate](src/models/prepared-mandate.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>storeMandate(request: Mandates.StoreMandateRequest, options?: RequestOptions): ApiPromise&lt;StoredMandate, Mandates.StoreMandateError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Re-verifies the signature, freshness, expiry and readiness, then writes the first event of the mandate's hash chain.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.mandates.storeMandate({
    body: {
      mandate: {
        version: 1,
        id: "2f4069f0-2367-4f08-acc6-d9cf1cf6669a",
        createdAt: new Date(Date.UTC(2026, 9, 20, 4, 18, 17, 928)),
        expiresAt: new Date(Date.UTC(2026, 10, 3, 4, 18, 17, 928)),
        shopperKey: "aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
        request: "Buy me black men's running shoes, size 10, under $120",
        intent: {
          item: "running shoes",
          category: "running shoes",
          quantity: 1,
          maxPrice: 120,
          currency: "USD",
          attributes: { size: "10", color: "black" },
          gender: Gender.Male,
          mustAsk: [],
        },
      },
      signature: "derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
    },
  });
  // TODO: Handle 'response' of type StoredMandate
} catch (err) {
  // TODO: Handle 'err' of type Mandates.StoreMandateError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.mandates.storeMandate({
  body: {
    mandate: {
      version: 1,
      id: "2f4069f0-2367-4f08-acc6-d9cf1cf6669a",
      createdAt: new Date(Date.UTC(2026, 9, 20, 4, 18, 17, 928)),
      expiresAt: new Date(Date.UTC(2026, 10, 3, 4, 18, 17, 928)),
      shopperKey: "aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
      request: "Buy me black men's running shoes, size 10, under $120",
      intent: {
        item: "running shoes",
        category: "running shoes",
        quantity: 1,
        maxPrice: 120,
        currency: "USD",
        attributes: { size: "10", color: "black" },
        gender: Gender.Male,
        mustAsk: [],
      },
    },
    signature: "derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
  },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type StoredMandate
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[SignedMandate](src/models/signed-mandate.ts)</code> | The mandate and the shopper's signature over it. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.mandates.storeMandate(request)`

- **OnSuccess**: <code>[StoredMandate](src/models/stored-mandate.ts)</code>
- **OnError**: throws <code>[Mandates.StoreMandateError](src/resources/mandates.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.mandates.storeMandate(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;StoredMandate, Mandates.StoreMandateError&gt;</code>, with `result.value` of type <code>[StoredMandate](src/models/stored-mandate.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## MandateRequests

> Source: [MandateRequests](src/resources/mandate-requests.ts)

<details>
<summary><code>actOnMandateRequest(request: MandateRequests.ActOnMandateRequestRequest, options?: RequestOptions): ApiPromise&lt;MandateRequestActionResult, MandateRequests.ActOnMandateRequestError&gt;</code></summary>

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

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.mandateRequests.actOnMandateRequest({
    requestId: "7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d",
    body: { action: "answer", answers: { "What size?": "M" } },
  });
  // TODO: Handle 'response' of type MandateRequestActionResult
} catch (err) {
  // TODO: Handle 'err' of type MandateRequests.ActOnMandateRequestError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.mandateRequests.actOnMandateRequest({
  requestId: "7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d",
  body: { action: "answer", answers: { "What size?": "M" } },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type MandateRequestActionResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>requestId</code> | <code>string</code> | Mandate request id. |
| <code>body</code> | <code>[MandateRequestAction](src/models/unions/mandate-request-action.ts)</code> | The shopper's answer, a request to prepare the mandate, or the signed mandate. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.mandateRequests.actOnMandateRequest(request)`

- **OnSuccess**: <code>[MandateRequestActionResult](src/models/unions/mandate-request-action-result.ts)</code>
- **OnError**: throws <code>[MandateRequests.ActOnMandateRequestError](src/resources/mandate-requests.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.mandateRequests.actOnMandateRequest(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;MandateRequestActionResult, MandateRequests.ActOnMandateRequestError&gt;</code>, with `result.value` of type <code>[MandateRequestActionResult](src/models/unions/mandate-request-action-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>getMandateRequest(request: MandateRequests.GetMandateRequestRequest, options?: RequestOptions): ApiPromise&lt;MandateRequest, MandateRequests.GetMandateRequestError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The draft an outside agent asked the shopper to sign, who is asking, and whether it is signed yet.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.mandateRequests.getMandateRequest({
    requestId: "7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d",
  });
  // TODO: Handle 'response' of type MandateRequest
} catch (err) {
  // TODO: Handle 'err' of type MandateRequests.GetMandateRequestError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.mandateRequests.getMandateRequest({
  requestId: "7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d",
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type MandateRequest
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>requestId</code> | <code>string</code> | Mandate request id. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.mandateRequests.getMandateRequest(request)`

- **OnSuccess**: <code>[MandateRequest](src/models/mandate-request.ts)</code>
- **OnError**: throws <code>[MandateRequests.GetMandateRequestError](src/resources/mandate-requests.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.mandateRequests.getMandateRequest(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;MandateRequest, MandateRequests.GetMandateRequestError&gt;</code>, with `result.value` of type <code>[MandateRequest](src/models/mandate-request.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Shopping

> Source: [Shopping](src/resources/shopping.ts)

<details>
<summary><code>shopMandate(request: Shopping.ShopMandateRequestParams, options?: RequestOptions): ApiPromise&lt;ShopResult, Shopping.ShopMandateError&gt;</code></summary>

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

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.shopping.shopMandate({
    mandateId: "2f4069f0-2367-4f08-acc6-d9cf1cf6669a",
    body: {},
  });
  // TODO: Handle 'response' of type ShopResult
} catch (err) {
  // TODO: Handle 'err' of type Shopping.ShopMandateError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.shopping.shopMandate({
  mandateId: "2f4069f0-2367-4f08-acc6-d9cf1cf6669a",
  body: {},
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ShopResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>mandateId</code> | <code>string</code> | Mandate id. |
| <code>body?</code> | <code>[ShopMandateRequest](src/models/shop-mandate-request.ts)</code> | Optional demo settings. Send {} for a normal run. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.shopping.shopMandate(request)`

- **OnSuccess**: <code>[ShopResult](src/models/shop-result.ts)</code>
- **OnError**: throws <code>[Shopping.ShopMandateError](src/resources/shopping.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.shopping.shopMandate(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ShopResult, Shopping.ShopMandateError&gt;</code>, with `result.value` of type <code>[ShopResult](src/models/shop-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Orders

> Source: [Orders](src/resources/orders.ts)

<details>
<summary><code>getOrder(request: Orders.GetOrderRequest, options?: RequestOptions): ApiPromise&lt;OrderView, Orders.GetOrderError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The purchase, the live undo window, the mandate behind it, and its verified event chain. Each event carries its proof.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.orders.getOrder({ orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6" });
  // TODO: Handle 'response' of type OrderView
} catch (err) {
  // TODO: Handle 'err' of type Orders.GetOrderError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.orders.getOrder({
  orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type OrderView
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>orderId</code> | <code>string</code> | Undo order id. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.orders.getOrder(request)`

- **OnSuccess**: <code>[OrderView](src/models/order-view.ts)</code>
- **OnError**: throws <code>[Orders.GetOrderError](src/resources/orders.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.orders.getOrder(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;OrderView, Orders.GetOrderError&gt;</code>, with `result.value` of type <code>[OrderView](src/models/order-view.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>getOrderEvidence(request: Orders.GetOrderEvidenceRequest, options?: RequestOptions): ApiPromise&lt;Evidence, Orders.GetOrderEvidenceError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Everything needed to check an order without trusting Undo: the raw hash-chained events exactly as hashed and
the signed mandate exactly as stored. Nothing is pre-verified, on purpose.


</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.orders.getOrderEvidence({ orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6" });
  // TODO: Handle 'response' of type Evidence
} catch (err) {
  // TODO: Handle 'err' of type Orders.GetOrderEvidenceError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.orders.getOrderEvidence({
  orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Evidence
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>orderId</code> | <code>string</code> | Undo order id. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.orders.getOrderEvidence(request)`

- **OnSuccess**: <code>[Evidence](src/models/evidence.ts)</code>
- **OnError**: throws <code>[Orders.GetOrderEvidenceError](src/resources/orders.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.orders.getOrderEvidence(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Evidence, Orders.GetOrderEvidenceError&gt;</code>, with `result.value` of type <code>[Evidence](src/models/evidence.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>undoOrder(request: Orders.UndoOrderRequest, options?: RequestOptions): ApiPromise&lt;UndoResult, Orders.UndoOrderError&gt;</code></summary>

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

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.orders.undoOrder({
    orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
    body: {
      reason: "This isn't what I asked for.",
      requestedAt: new Date(Date.UTC(2026, 9, 20, 16, 30, 0)),
      signature: "derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
    },
  });
  // TODO: Handle 'response' of type UndoResult
} catch (err) {
  // TODO: Handle 'err' of type Orders.UndoOrderError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.orders.undoOrder({
  orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
  body: {
    reason: "This isn't what I asked for.",
    requestedAt: new Date(Date.UTC(2026, 9, 20, 16, 30, 0)),
    signature: "derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
  },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type UndoResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>orderId</code> | <code>string</code> | Undo order id. |
| <code>body</code> | <code>[UndoRequest](src/models/undo-request.ts)</code> | Why the shopper is undoing, an optional photo, and their signature. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.orders.undoOrder(request)`

- **OnSuccess**: <code>[UndoResult](src/models/undo-result.ts)</code>
- **OnError**: throws <code>[Orders.UndoOrderError](src/resources/orders.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.orders.undoOrder(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;UndoResult, Orders.UndoOrderError&gt;</code>, with `result.value` of type <code>[UndoResult](src/models/undo-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Merchant

> Source: [Merchant](src/resources/merchant.ts)

<details>
<summary><code>getMerchantRules(options?: RequestOptions): ApiPromise&lt;MerchantRules, ApiError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The rules the store applies to agents at checkout: block below a trust score, lengthen the undo window below a score, or accept only registered operators.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.merchant.getMerchantRules();
  // TODO: Handle 'response' of type MerchantRules
} catch (err) {
  // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.merchant.getMerchantRules().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type MerchantRules
} else {
  // TODO: Handle 'result', where 'result.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.merchant.getMerchantRules()`

- **OnSuccess**: <code>[MerchantRules](src/models/merchant-rules.ts)</code>
- **OnError**: throws <code>[ApiError](src/core/api-error.ts)</code>, with `err.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm

**As ApiResult**: `await client.merchant.getMerchantRules().asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;MerchantRules, ApiError&gt;</code>, with `result.value` of type <code>[MerchantRules](src/models/merchant-rules.ts)</code>
- **OnError**: `result.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>listMerchantActivity(request: Merchant.ListMerchantActivityRequest, options?: RequestOptions): ApiPromise&lt;ActivityFeed, ApiError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Every step Undo records, newest first (up to 60). Pass `after` to get only events newer than that id.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.merchant.listMerchantActivity({ after: 1200 });
  // TODO: Handle 'response' of type ActivityFeed
} catch (err) {
  // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.merchant.listMerchantActivity({ after: 1200 }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ActivityFeed
} else {
  // TODO: Handle 'result', where 'result.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>after?</code> | <code>number</code> | Only events with an id greater than this. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.merchant.listMerchantActivity(request)`

- **OnSuccess**: <code>[ActivityFeed](src/models/activity-feed.ts)</code>
- **OnError**: throws <code>[ApiError](src/core/api-error.ts)</code>, with `err.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm

**As ApiResult**: `await client.merchant.listMerchantActivity(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ActivityFeed, ApiError&gt;</code>, with `result.value` of type <code>[ActivityFeed](src/models/activity-feed.ts)</code>
- **OnError**: `result.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>listMerchantAgents(options?: RequestOptions): ApiPromise&lt;MerchantAgents, ApiError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Every agent that has shopped here, its record and trust score with every point explained, and what the store's rules do to it.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.merchant.listMerchantAgents();
  // TODO: Handle 'response' of type MerchantAgents
} catch (err) {
  // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.merchant.listMerchantAgents().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type MerchantAgents
} else {
  // TODO: Handle 'result', where 'result.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.merchant.listMerchantAgents()`

- **OnSuccess**: <code>[MerchantAgents](src/models/merchant-agents.ts)</code>
- **OnError**: throws <code>[ApiError](src/core/api-error.ts)</code>, with `err.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm

**As ApiResult**: `await client.merchant.listMerchantAgents().asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;MerchantAgents, ApiError&gt;</code>, with `result.value` of type <code>[MerchantAgents](src/models/merchant-agents.ts)</code>
- **OnError**: `result.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>listMerchantOrders(options?: RequestOptions): ApiPromise&lt;MerchantOrders, ApiError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Every agent order (latest 300) with its verdict, who pays and any agent payout, plus headline numbers.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.merchant.listMerchantOrders();
  // TODO: Handle 'response' of type MerchantOrders
} catch (err) {
  // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.merchant.listMerchantOrders().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type MerchantOrders
} else {
  // TODO: Handle 'result', where 'result.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.merchant.listMerchantOrders()`

- **OnSuccess**: <code>[MerchantOrders](src/models/merchant-orders.ts)</code>
- **OnError**: throws <code>[ApiError](src/core/api-error.ts)</code>, with `err.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm

**As ApiResult**: `await client.merchant.listMerchantOrders().asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;MerchantOrders, ApiError&gt;</code>, with `result.value` of type <code>[MerchantOrders](src/models/merchant-orders.ts)</code>
- **OnError**: `result.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>resolveOrder(request: Merchant.ResolveOrderRequestParams, options?: RequestOptions): ApiPromise&lt;ResolveOrderResult, Merchant.ResolveOrderError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The merchant's side of an Undo. Sandbox only.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.merchant.resolveOrder({
    orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
    body: { action: ResolveAction.RetrySettlement },
  });
  // TODO: Handle 'response' of type ResolveOrderResult
} catch (err) {
  // TODO: Handle 'err' of type Merchant.ResolveOrderError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.merchant.resolveOrder({
  orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
  body: { action: ResolveAction.RetrySettlement },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ResolveOrderResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>orderId</code> | <code>string</code> | Undo order id. |
| <code>body</code> | <code>[ResolveOrderRequest](src/models/resolve-order-request.ts)</code> | The merchant's decision. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.merchant.resolveOrder(request)`

- **OnSuccess**: <code>[ResolveOrderResult](src/models/resolve-order-result.ts)</code>
- **OnError**: throws <code>[Merchant.ResolveOrderError](src/resources/merchant.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.merchant.resolveOrder(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ResolveOrderResult, Merchant.ResolveOrderError&gt;</code>, with `result.value` of type <code>[ResolveOrderResult](src/models/resolve-order-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>updateMerchantRules(request: Merchant.UpdateMerchantRulesRequest, options?: RequestOptions): ApiPromise&lt;MerchantRules, Merchant.UpdateMerchantRulesError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Applies from the next checkout, for Undo's agent and every MCP agent. Each change is recorded in the store's event chain.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.merchant.updateMerchantRules({
    body: { blockBelow: 1, extendBelow: 50, extendMinutes: 360, blockUnverified: false },
  });
  // TODO: Handle 'response' of type MerchantRules
} catch (err) {
  // TODO: Handle 'err' of type Merchant.UpdateMerchantRulesError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.merchant.updateMerchantRules({
  body: { blockBelow: 1, extendBelow: 50, extendMinutes: 360, blockUnverified: false },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type MerchantRules
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[MerchantRules](src/models/merchant-rules.ts)</code> | The rules to apply from the next checkout. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.merchant.updateMerchantRules(request)`

- **OnSuccess**: <code>[MerchantRules](src/models/merchant-rules.ts)</code>
- **OnError**: throws <code>[Merchant.UpdateMerchantRulesError](src/resources/merchant.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.merchant.updateMerchantRules(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;MerchantRules, Merchant.UpdateMerchantRulesError&gt;</code>, with `result.value` of type <code>[MerchantRules](src/models/merchant-rules.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Service

> Source: [Service](src/resources/service.ts)

<details>
<summary><code>getHealth(request: Service.GetHealthRequest, options?: RequestOptions): ApiPromise&lt;Health, Service.GetHealthError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Shallow health check. With `deep`, also proves the service can reach PayPal sandbox and the database. Never returns secret values.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.service.getHealth({ deep: "1" });
  // TODO: Handle 'response' of type Health
} catch (err) {
  // TODO: Handle 'err' of type Service.GetHealthError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.service.getHealth({ deep: "1" }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Health
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>deep?</code> | <code>string</code> | Present (any value) to also check PayPal and the database. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.service.getHealth(request)`

- **OnSuccess**: <code>[Health](src/models/health.ts)</code>
- **OnError**: throws <code>[Service.GetHealthError](src/resources/service.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.service.getHealth(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Health, Service.GetHealthError&gt;</code>, with `result.value` of type <code>[Health](src/models/health.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[UndoApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

