# Shop inside a mandate (/docs/api/undo/shopping/shopMandate)

`POST /api/mandates/{mandateId}/shop`

Undo's agent searches, checks the cart against the signed limits, and opens a PayPal checkout in AUTHORIZE
mode. Without a saved wallet the shopper approves at `approveUrl`; with one (and only if the mandate allows it)
the money is held straight away. One live purchase per mandate. Rate limited per visitor.


```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/mandates/{mandateId}/shop:
    post:
      tags:
        - Shopping
      operationId: shopMandate
      summary: Shop inside a mandate
      description: >
        Undo's agent searches, checks the cart against the signed limits, and
        opens a PayPal checkout in AUTHORIZE

        mode. Without a saved wallet the shopper approves at `approveUrl`; with
        one (and only if the mandate allows it)

        the money is held straight away. One live purchase per mandate. Rate
        limited per visitor.
      parameters:
        - $ref: "#/components/parameters/MandateId"
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ShopMandateRequest"
            examples:
              default:
                value: {}
        description: Optional demo settings. Send {} for a normal run.
      responses:
        "201":
          description: Checkout opened.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ShopResult"
              examples:
                default:
                  value:
                    orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
                    approveUrl: https://www.sandbox.paypal.com/checkoutnow?token=1X507517Y8961004F
                    status: CHECKOUT_CREATED
                    windowEndsAt: null
                    paidWith: approval
                    cart:
                      title: UA Infinite Pro Men's Running Shoes
                      brand: Under Armour
                      variant:
                        Size: "10.5"
                        Color: Black
                      price: 116.97
                      currency: USD
                      quantity: 1
                      retailer: underarmour.com
                      imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5BRG5D3YC8J46QPWBYB58RG&mid=oKaH
                    agent:
                      reasoning: Picked UA Infinite Pro Men's Running Shoes in Black / 10.5 — looked
                        like the best match.
                      confidence: 0.9
                      unverified: []
                      guard:
                        relaxed: []
                        bypassed: true
                        violations:
                          - rule: attribute:size
                            actual: "10.5"
                            expected: "10"
                      considered:
                        - id: w25336I
                          ok: false
                          price: 116.97
                          title: UA Infinite Pro Men's Running Shoes
                    undoWindow:
                      minutes: 1080
                      factors:
                        - factor: order total $116.97
                          minutes: 360
                        - factor: agent bypassed Undo's pre-purchase check
                          minutes: 720
                    trust:
                      score: 50
                      tier: neutral
        "403":
          description: The store's rules refused this agent.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
              examples:
                default:
                  value:
                    error: agent_blocked
                    detail: This store only accepts registered agent operators.
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          description: The mandate is not active, or a purchase is already open (`orderId`
            names it).
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
              examples:
                default:
                  value:
                    error: purchase_already_open
                    orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
        "422":
          description: No product fits the mandate.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
              examples:
                default:
                  value:
                    error: no_compliant_product
                    considered: 8
        "429":
          $ref: "#/components/responses/RateLimited"
        "502":
          $ref: "#/components/responses/UpstreamError"
        "503":
          $ref: "#/components/responses/Unavailable"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Shopping.ShopMandate(
                      new ShopMandateOperationRequest
                      {
                          MandateId = Guid.Parse(
                              "2f4069f0-2367-4f08-acc6-d9cf1cf6669a"),
                          Body = new ShopMandateRequest(),
                      });
                  // TODO: Handle 'response' of type ShopResult
              }
              catch (ApiException<ShopMandateError> ex)
              {
                  if (ex.Error.TryGetError(out var error))
                  {
                      // TODO: Handle 'error' of type Error
                  }
              }
        - lang: python
          label: Python
          sources:
            Example: |-
              try:
                  response = client.shopping.shop_mandate(
                      UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a"),
                      body=ShopMandateRequest(),
                  )
                  # TODO: Handle 'response' of type ShopResult
              except ApiError as e:
                  # TODO: Handle 'e.error' of type ShopMandateErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.shopping.shopMandate({
                  mandateId: "2f4069f0-2367-4f08-acc6-d9cf1cf6669a",
                  body: {},
                });
                // TODO: Handle 'response' of type ShopResult
              } catch (err) {
                // TODO: Handle 'err' of type Shopping.ShopMandateError, discriminated with 'err.payload.kind'
              }
components:
  parameters:
    MandateId:
      name: mandateId
      in: path
      required: true
      description: Mandate id.
      schema:
        type: string
        format: uuid
        description: Mandate id.
        examples:
          - 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
  schemas:
    ShopMandateRequest:
      type: object
      properties:
        simulate:
          $ref: "#/components/schemas/SimulateMode"
      description: Options for a shopping run. Send an empty object for a normal run.
      examples:
        - simulate: unguarded_wrong_variant
    ShopResult:
      type: object
      required:
        - orderId
        - status
        - cart
        - agent
        - undoWindow
        - trust
        - paidWith
      properties:
        orderId:
          type: string
          format: uuid
          description: The new order. Read it with getOrder.
          examples:
            - edd288bc-42d0-41d3-9b87-14915f3ff2c6
        approveUrl:
          type:
            - string
            - "null"
          description: Where the shopper approves the payment in PayPal (absent when paid
            with a saved wallet).
          examples:
            - https://www.sandbox.paypal.com/checkoutnow?token=1X507517Y8961004F
        status:
          $ref: "#/components/schemas/CheckoutStatus"
        windowEndsAt:
          type:
            - string
            - "null"
          format: date-time
          description: When the undo window closes, once the money is held.
          examples:
            - null
        paidWith:
          $ref: "#/components/schemas/PaidWith"
        walletNote:
          type: string
          description: Why a saved wallet was not used, when the mandate allowed one.
          examples:
            - No saved wallet on this device, so the shopper approves in PayPal.
        cart:
          $ref: "#/components/schemas/Cart"
        agent:
          type: object
          description: The agent's reasoning, confidence and the guard's checks.
          additionalProperties: true
          examples:
            - reasoning: Picked UA Infinite Pro Men's Running Shoes in Black / 10.5 — looked
                like the best match.
              confidence: 0.9
              unverified: []
              guard:
                relaxed: []
                bypassed: true
                violations:
                  - rule: attribute:size
                    actual: "10.5"
                    expected: "10"
              considered:
                - id: w25336I
                  ok: false
                  price: 116.97
                  title: UA Infinite Pro Men's Running Shoes
        undoWindow:
          $ref: "#/components/schemas/UndoWindow"
        trust:
          $ref: "#/components/schemas/Trust"
      description: A checkout opened by Undo's agent inside a mandate.
      examples:
        - orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
          approveUrl: https://www.sandbox.paypal.com/checkoutnow?token=1X507517Y8961004F
          status: CHECKOUT_CREATED
          windowEndsAt: null
          paidWith: approval
          cart:
            title: UA Infinite Pro Men's Running Shoes
            brand: Under Armour
            variant:
              Size: "10.5"
              Color: Black
            price: 116.97
            currency: USD
            quantity: 1
            retailer: underarmour.com
            imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5BRG5D3YC8J46QPWBYB58RG&mid=oKaH
          agent:
            reasoning: Picked UA Infinite Pro Men's Running Shoes in Black / 10.5 — looked
              like the best match.
            confidence: 0.9
            unverified: []
            guard:
              relaxed: []
              bypassed: true
              violations:
                - rule: attribute:size
                  actual: "10.5"
                  expected: "10"
            considered:
              - id: w25336I
                ok: false
                price: 116.97
                title: UA Infinite Pro Men's Running Shoes
          undoWindow:
            minutes: 1080
            factors:
              - factor: order total $116.97
                minutes: 360
              - factor: agent bypassed Undo's pre-purchase check
                minutes: 720
          trust:
            score: 50
            tier: neutral
    Error:
      type: object
      required:
        - error
      properties:
        error:
          type: string
          description: Machine-readable code, for example `not_found`, `bad_signature`,
            `purchase_already_open`.
          examples:
            - not_found
        detail:
          type: string
          description: Human-readable detail, when there is one.
          examples:
            - That's a lot of tries in a short time. Give it 2 minutes and try
              again.
        issues:
          type: array
          description: Validation problems, on `invalid_request`.
          items:
            type: object
            additionalProperties: true
            description: One entry in issues.
            examples:
              - {}
          examples:
            - - {}
      additionalProperties: true
      description: An error. error is a stable machine-readable code; detail explains it.
      examples:
        - error: not_found
    RateLimited:
      type: object
      required:
        - error
        - detail
        - retryAfter
      properties:
        error:
          $ref: "#/components/schemas/RateLimitCode"
        detail:
          type: string
          description: What happened and how long to wait, in plain words.
          examples:
            - That's a lot of tries in a short time. Give it 2 minutes and try
              again.
        retryAfter:
          type: integer
          description: Seconds to wait.
          examples:
            - 120
      description: Returned with 429 when this visitor made too many requests or a
        free-tier budget is spent.
      examples:
        - error: rate_limited
          detail: That's a lot of tries in a short time. Give it 2 minutes and try again.
          retryAfter: 120
    RateLimitCode:
      type: string
      enum:
        - rate_limited
      description: The error code on a 429.
      examples:
        - rate_limited
    CheckoutStatus:
      type: string
      enum:
        - CHECKOUT_CREATED
        - AUTHORIZED
      description: Where a new checkout stands.
      examples:
        - CHECKOUT_CREATED
    PaidWith:
      type: string
      enum:
        - approval
        - saved_wallet
      description: How a purchase was paid.
      examples:
        - approval
    Cart:
      type: object
      required:
        - title
        - variant
        - price
        - currency
        - quantity
      properties:
        title:
          type: string
          description: Product title.
          examples:
            - UA Infinite Pro Men's Running Shoes
        brand:
          type:
            - string
            - "null"
          description: Brand name, when known.
          examples:
            - Under Armour
        variant:
          type: object
          additionalProperties:
            type: string
            description: The value for one key in variant.
            examples:
              - Size 10.5 · Color Black
          description: The exact variant bought.
          examples:
            - key: Size 10.5 · Color Black
        price:
          type: number
          description: Price per item in currency units.
          examples:
            - 1.5
        currency:
          type: string
          description: ISO 4217 currency code.
          examples:
            - USD
        quantity:
          type: integer
          description: Number of items.
          examples:
            - 1
        retailer:
          type: string
          description: The retailer's domain.
          examples:
            - underarmour.com
        imageUrl:
          type:
            - string
            - "null"
          description: Product image URL, when there is one.
          examples:
            - https://cdn.trychannel3.com/example.jpg
      description: What the agent put in the cart.
      examples:
        - title: UA Infinite Pro Men's Running Shoes
          brand: Under Armour
          variant:
            key: Size 10.5 · Color Black
          price: 1.5
          currency: USD
          quantity: 1
          retailer: underarmour.com
          imageUrl: https://cdn.trychannel3.com/example.jpg
    UndoWindow:
      type: object
      required:
        - minutes
        - factors
      properties:
        minutes:
          type: integer
          description: Total window length.
          examples:
            - 1080
        factors:
          type: array
          description: Why the window is this long, factor by factor.
          items:
            $ref: "#/components/schemas/UndoWindowFactor"
          examples:
            - - factor: order total $116.97
                minutes: 360
              - factor: agent bypassed Undo's pre-purchase check
                minutes: 720
      description: How long the shopper can undo for free, and why.
      examples:
        - minutes: 1080
          factors:
            - factor: order total $116.97
              minutes: 360
            - factor: agent bypassed Undo's pre-purchase check
              minutes: 720
    Trust:
      type: object
      required:
        - score
        - tier
      properties:
        score:
          type: integer
          minimum: 0
          maximum: 100
          description: 0 to 100, from the agent's record at this store.
          examples:
            - 62
        tier:
          $ref: "#/components/schemas/TrustTier"
        factors:
          type: array
          items:
            $ref: "#/components/schemas/TrustFactor"
          description: Every point in the score, explained.
          examples:
            - - label: unregistered name
                points: 50
              - label: 4 clean purchases
                points: 12
      description: An agent's trust score at this store, with every point explained.
      examples:
        - score: 62
          tier: neutral
          factors:
            - label: unregistered name
              points: 50
            - label: 4 clean purchases
              points: 12
    TrustTier:
      type: string
      enum:
        - trusted
        - neutral
        - risky
      description: An agent's trust band.
      examples:
        - trusted
    TrustFactor:
      type: object
      required:
        - label
        - points
      properties:
        label:
          type: string
          description: What earned or cost points.
          examples:
            - unregistered name
        points:
          type: integer
          description: Points added (negative when taken away).
          examples:
            - 1
      description: One part of an agent's trust score.
      examples:
        - label: unregistered name
          points: 1
    UndoWindowFactor:
      type: object
      required:
        - factor
        - minutes
      properties:
        factor:
          type: string
          description: What added time, in plain words.
          examples:
            - order total $116.97
        minutes:
          type: integer
          description: Minutes it added.
          examples:
            - 1
      description: One reason the undo window is as long as it is.
      examples:
        - factor: order total $116.97
          minutes: 1
    SimulateMode:
      type: string
      enum:
        - unguarded_wrong_variant
      description: Demo agents that misbehave on purpose.
      examples:
        - unguarded_wrong_variant
  responses:
    NotFound:
      description: Not found.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          examples:
            default:
              value:
                error: not_found
    RateLimited:
      description: Too many requests from this visitor, or the free-tier budget is spent.
      headers:
        Retry-After:
          description: Seconds to wait.
          schema:
            type: integer
            description: Seconds to wait before trying again.
            examples:
              - 120
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/RateLimited"
          examples:
            default:
              value:
                error: rate_limited
                detail: That's a lot of tries in a short time. Give it 2 minutes and try again.
                retryAfter: 120
    UpstreamError:
      description: PayPal, the catalog or the AI model failed.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          examples:
            default:
              value:
                error: paypal_checkout_failed
                detail: PayPal returned 500
    Unavailable:
      description: The AI model is unavailable right now.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          examples:
            default:
              value:
                error: ai_unavailable
info:
  title: Undo API
  version: 1.0.0
```