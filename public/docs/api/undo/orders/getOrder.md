# Get an order (/docs/api/undo/orders/getOrder)

`GET /api/orders/{orderId}`

The purchase, the live undo window, the mandate behind it, and its verified event chain. Each event carries its proof.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/orders/{orderId}:
    get:
      tags:
        - Orders
      operationId: getOrder
      summary: Get an order
      description: The purchase, the live undo window, the mandate behind it, and its
        verified event chain. Each event carries its proof.
      parameters:
        - $ref: "#/components/parameters/OrderId"
      responses:
        "200":
          description: The order.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OrderView"
              examples:
                default:
                  value:
                    order:
                      id: edd288bc-42d0-41d3-9b87-14915f3ff2c6
                      status: REFUNDED
                      amount: "116.97"
                      currency: USD
                      quantity: 1
                      product:
                        brand: Under Armour
                        price: 116.97
                        title: UA Infinite Pro Men's Running Shoes
                        colors:
                          - "#1e1e20"
                          - "#d5d4d8"
                        variant:
                          Size: "10.5"
                          Color: Black
                        currency: USD
                        imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5BRG5D3YC8J46QPWBYB58RG&mid=oKaH
                        sourceUrl: https://buy.trychannel3.com/w25336I-oKaH-Wqce8l?o=01KVATPXMQW09XVTMRDEW2Q1Y9&aid=01M5BRG5D3YC8J46QPWBYB58RG
                        attributes:
                          pattern:
                            - Texture
                            - Geometric
                          activity:
                            - Running
                          shoe-fit:
                            - Regular
                          toe-style:
                            - Round
                          closure-type:
                            - Straps
                            - Lace-up
                          shoe-features:
                            - Breathable design
                            - Cushioned
                          lining-material:
                            - Synthetic
                          heel-height-type:
                            - Flat
                            - Low
                          outsole-material:
                            - Rubber
                          footwear-material:
                            - Mesh
                            - Polyester
                          footwear-support-type:
                            - Neutral
                            - Stability
                        channel3Id: w25336I
                        description: These men's running shoes from Under Armour, the UA Infinite Pro,
                          are designed for endurance with a focus on comfort and
                          support. They feature a breathable e…
                        sourceDomain: underarmour.com
                        variantOptions:
                          - name: Color
                            values:
                              - Black
                              - White
                          - name: Size
                            values:
                              - "7"
                              - "8"
                      agent:
                        guard:
                          relaxed: []
                          bypassed: true
                          violations:
                            - rule: attribute:size
                              actual: "10.5"
                              expected: "10"
                        model: null
                        operator:
                          via: web
                          name: Careless demo agent
                          verified: false
                        searches:
                          - query: black running shoes
                            filters: price+gender+category_ids+colors
                        reasoning: Picked UA Infinite Pro Men's Running Shoes in Black / 10.5 — looked
                          like the best match.
                        requested:
                          Size: "10"
                          Color: Black
                        simulated: unguarded_wrong_variant
                        confidence: 0.9
                        considered:
                          - id: w25336I
                            ok: false
                            price: 116.97
                            title: UA Infinite Pro Men's Running Shoes
                        unverified: []
                        approximate: []
                      paypal:
                        orderId: 1X507517Y8961004F
                        authorizationId: 4LD43914UL8743542
                        captureId: 4087729233507714F
                      resolution:
                        at: 2026-10-20T04:36:46.194Z
                        action:
                          type: REFUND_FULL
                          reason: "agent broke the mandate: full refund, liability on the agent operator"
                        decision:
                          verdict: AGENT_FAULT
                          evidence:
                            - source: shopper
                              finding: This isn't what I asked for.
                            - source: mandate_check
                              finding: "attribute:size: mandate required 10, agent bought 10.5"
                          liability: agent_operator
                          confidence: 1
                        settlement:
                          at: 2026-10-20T04:36:47.717Z
                          to: 8QKQG7YKAEQLW
                          from: Careless demo agent
                          amount: "116.97"
                          status: SUCCESS
                          attempt: 1
                          currency: USD
                          payoutItemId: Z8UUKQLA3ERPQ
                          payoutBatchId: Q2GJQLQFMJWTY
                          transactionId: 3JU78306XG5327728
                    undoWindow:
                      factors:
                        - factor: order total $116.97
                          minutes: 360
                        - factor: agent bypassed Undo's pre-purchase check
                          minutes: 720
                      minutes: 1080
                      endsAt: 2026-10-20T04:36:44.167Z
                      open: false
                      minutesLeft: 0
                    mandate:
                      id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                      request: Buy me black men's running shoes, size 10, under $120
                      intent:
                        item: running shoes
                        category: running shoes
                        quantity: 1
                        maxPrice: 120
                        currency: USD
                        attributes:
                          size: "10"
                          color: black
                        gender: male
                        mustAsk: []
                      status: FULFILLED
                      shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
                    chain:
                      intact: true
                      events:
                        - seq: 0
                          type: MANDATE_SIGNED
                          createdAt: 2026-10-20T04:18:18.268Z
                          hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
                          proof:
                            kind: signature
                            how: Ed25519 signature from the shopper's device verified against the mandate's
                              exact bytes.
                            ref: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
                        - seq: 1
                          type: CART_PROPOSED
                          createdAt: 2026-10-20T04:18:18.832Z
                          hash: 89f7646662727852af27cbdf1e326a17b6cc76c2bd462031bbf8f1f29622e323
                          proof:
                            kind: rule
                            how: Proposed without Undo's guard.
                            checks:
                              - by: rule
                                text: The agent skipped Undo's pre-purchase guard (careless demo agent).
                              - by: rule
                                text: "Breaks the mandate: size should be 10, is 10.5."
        "404":
          $ref: "#/components/responses/NotFound"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Orders.GetOrder(
                      new GetOrderRequest
                      {
                          OrderId = Guid.Parse(
                              "edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
                      });
                  // TODO: Handle 'response' of type OrderView
              }
              catch (ApiException<GetOrderError> ex)
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
                  response = client.orders.get_order(
                      UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6")
                  )
                  # TODO: Handle 'response' of type OrderView
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type GetOrderErrorBody
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.orders.getOrder({
                  orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
                });
                // TODO: Handle 'response' of type OrderView
              } catch (err) {
                // TODO: Handle 'err' of type Orders.GetOrderError, discriminated with 'err.payload.kind'
              }
components:
  parameters:
    OrderId:
      name: orderId
      in: path
      required: true
      description: Undo order id.
      schema:
        type: string
        format: uuid
        description: Undo order id.
        examples:
          - edd288bc-42d0-41d3-9b87-14915f3ff2c6
  schemas:
    OrderView:
      type: object
      required:
        - order
        - undoWindow
        - chain
      properties:
        order:
          $ref: "#/components/schemas/Order"
        undoWindow:
          $ref: "#/components/schemas/UndoWindowStatus"
        mandate:
          $ref: "#/components/schemas/MandateSummary"
        chain:
          $ref: "#/components/schemas/EventChain"
      description: An order, its undo window, its mandate and its verified event chain.
      examples:
        - order:
            id: edd288bc-42d0-41d3-9b87-14915f3ff2c6
            status: REFUNDED
            amount: "116.97"
            currency: USD
            quantity: 1
            product:
              brand: Under Armour
              price: 116.97
              title: UA Infinite Pro Men's Running Shoes
              colors:
                - "#1e1e20"
                - "#d5d4d8"
              variant:
                Size: "10.5"
                Color: Black
              currency: USD
              imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5BRG5D3YC8J46QPWBYB58RG&mid=oKaH
              sourceUrl: https://buy.trychannel3.com/w25336I-oKaH-Wqce8l?o=01KVATPXMQW09XVTMRDEW2Q1Y9&aid=01M5BRG5D3YC8J46QPWBYB58RG
              attributes:
                pattern:
                  - Texture
                  - Geometric
                activity:
                  - Running
                shoe-fit:
                  - Regular
                toe-style:
                  - Round
                closure-type:
                  - Straps
                  - Lace-up
                shoe-features:
                  - Breathable design
                  - Cushioned
                lining-material:
                  - Synthetic
                heel-height-type:
                  - Flat
                  - Low
                outsole-material:
                  - Rubber
                footwear-material:
                  - Mesh
                  - Polyester
                footwear-support-type:
                  - Neutral
                  - Stability
              channel3Id: w25336I
              description: These men's running shoes from Under Armour, the UA Infinite Pro,
                are designed for endurance with a focus on comfort and support.
                They feature a breathable e…
              sourceDomain: underarmour.com
              variantOptions:
                - name: Color
                  values:
                    - Black
                    - White
                - name: Size
                  values:
                    - "7"
                    - "8"
            agent:
              guard:
                relaxed: []
                bypassed: true
                violations:
                  - rule: attribute:size
                    actual: "10.5"
                    expected: "10"
              model: null
              operator:
                via: web
                name: Careless demo agent
                verified: false
              searches:
                - query: black running shoes
                  filters: price+gender+category_ids+colors
              reasoning: Picked UA Infinite Pro Men's Running Shoes in Black / 10.5 — looked
                like the best match.
              requested:
                Size: "10"
                Color: Black
              simulated: unguarded_wrong_variant
              confidence: 0.9
              considered:
                - id: w25336I
                  ok: false
                  price: 116.97
                  title: UA Infinite Pro Men's Running Shoes
              unverified: []
              approximate: []
            paypal:
              orderId: 1X507517Y8961004F
              authorizationId: 4LD43914UL8743542
              captureId: 4087729233507714F
            resolution:
              at: 2026-10-20T04:36:46.194Z
              action:
                type: REFUND_FULL
                reason: "agent broke the mandate: full refund, liability on the agent operator"
              decision:
                verdict: AGENT_FAULT
                evidence:
                  - source: shopper
                    finding: This isn't what I asked for.
                  - source: mandate_check
                    finding: "attribute:size: mandate required 10, agent bought 10.5"
                liability: agent_operator
                confidence: 1
              settlement:
                at: 2026-10-20T04:36:47.717Z
                to: 8QKQG7YKAEQLW
                from: Careless demo agent
                amount: "116.97"
                status: SUCCESS
                attempt: 1
                currency: USD
                payoutItemId: Z8UUKQLA3ERPQ
                payoutBatchId: Q2GJQLQFMJWTY
                transactionId: 3JU78306XG5327728
          undoWindow:
            factors:
              - factor: order total $116.97
                minutes: 360
              - factor: agent bypassed Undo's pre-purchase check
                minutes: 720
            minutes: 1080
            endsAt: 2026-10-20T04:36:44.167Z
            open: false
            minutesLeft: 0
          mandate:
            id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
            request: Buy me black men's running shoes, size 10, under $120
            intent:
              item: running shoes
              category: running shoes
              quantity: 1
              maxPrice: 120
              currency: USD
              attributes:
                size: "10"
                color: black
              gender: male
              mustAsk: []
            status: FULFILLED
            shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
          chain:
            intact: true
            events:
              - seq: 0
                type: MANDATE_SIGNED
                createdAt: 2026-10-20T04:18:18.268Z
                hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
                proof:
                  kind: signature
                  how: Ed25519 signature from the shopper's device verified against the mandate's
                    exact bytes.
                  ref: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
              - seq: 1
                type: CART_PROPOSED
                createdAt: 2026-10-20T04:18:18.832Z
                hash: 89f7646662727852af27cbdf1e326a17b6cc76c2bd462031bbf8f1f29622e323
                proof:
                  kind: rule
                  how: Proposed without Undo's guard.
                  checks:
                    - by: rule
                      text: The agent skipped Undo's pre-purchase guard (careless demo agent).
                    - by: rule
                      text: "Breaks the mandate: size should be 10, is 10.5."
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
    Order:
      type: object
      required:
        - id
        - status
        - amount
        - currency
        - quantity
        - product
        - paypal
      properties:
        id:
          type: string
          format: uuid
          description: Undo order id.
          examples:
            - edd288bc-42d0-41d3-9b87-14915f3ff2c6
        status:
          $ref: "#/components/schemas/OrderStatus"
        amount:
          type: string
          description: Total held or charged, as a decimal string.
          examples:
            - "116.97"
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
        product:
          $ref: "#/components/schemas/Product"
        agent:
          type: object
          additionalProperties: true
          description: The agent's reasoning, confidence, guard checks and operator, as
            recorded at checkout.
          examples:
            - {}
        paypal:
          $ref: "#/components/schemas/PayPalIds"
        resolution:
          type:
            - object
            - "null"
          description: The latest Undo, with verdict, evidence, money action and any agent
            payout.
          additionalProperties: true
          examples:
            - {}
      description: The purchase.
      examples:
        - id: edd288bc-42d0-41d3-9b87-14915f3ff2c6
          status: AUTHORIZED
          amount: "116.97"
          currency: USD
          quantity: 1
          product:
            channel3Id: w25336I
            title: UA Infinite Pro Men's Running Shoes
            brand: Under Armour
            description: These men's running shoes from Under Armour, the UA Infinite Pro,
              are designed for endurance with a focus on comfort and support.
              They feature a breathable e…
            price: 116.97
            currency: USD
            imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5D44F1Y9VDE34RVPPTF1H15&mid=oKaH
            sourceUrl: https://buy.trychannel3.com/w25336I-oKaH-Wqce8l?o=01KVATPXMQW09XVTMRDEW2Q1Y9&aid=01M5D44F1Y9VDE34RVPPTF1H15
            sourceDomain: underarmour.com
            colors:
              - "#1e1e20"
              - "#d5d4d8"
            attributes:
              activity:
                - Running
              pattern:
                - Texture
                - Geometric
              closure-type:
                - Straps
                - Lace-up
              heel-height-type:
                - Flat
                - Low
              footwear-material:
                - Mesh
                - Polyester
              shoe-fit:
                - Regular
              shoe-features:
                - Breathable design
                - Cushioned
              toe-style:
                - Round
              outsole-material:
                - Rubber
              footwear-support-type:
                - Neutral
                - Stability
              lining-material:
                - Synthetic
            variant:
              Size: "10.5"
            variantOptions:
              - name: Color
                values:
                  - Black
                  - White
              - name: Size
                values:
                  - "7"
                  - "8"
          agent: {}
          paypal:
            orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
            authorizationId: 4LD43914UL8743542
            captureId: 4087729233507714F
          resolution: {}
    UndoWindowStatus:
      type: object
      description: "The undo window on an order: how long, why, and whether it is
        still open."
      required:
        - minutes
        - factors
        - open
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
        endsAt:
          type:
            - string
            - "null"
          format: date-time
          description: When the window closes.
          examples:
            - 2026-10-20T16:30:00.000Z
        open:
          type: boolean
          description: "True while the money is only held and the window hasn't closed:
            Undo is a free void."
          examples:
            - true
        minutesLeft:
          type:
            - integer
            - "null"
          description: Minutes until the window closes.
          examples:
            - 1
      examples:
        - minutes: 1080
          factors:
            - factor: order total $116.97
              minutes: 360
            - factor: agent bypassed Undo's pre-purchase check
              minutes: 720
          endsAt: 2026-10-20T16:30:00.000Z
          open: true
          minutesLeft: 1
    MandateSummary:
      type: object
      properties:
        id:
          type: string
          format: uuid
          description: Mandate id.
          examples:
            - edd288bc-42d0-41d3-9b87-14915f3ff2c6
        request:
          type: string
          description: The shopper's request in their own words.
          examples:
            - A black hoodie in size M under $80
        intent:
          $ref: "#/components/schemas/IntentDraft"
        status:
          type: string
          description: Mandate status.
          examples:
            - FULFILLED
        shopperKey:
          type: string
          description: The shopper's public key. Undo requests must be signed by it.
          examples:
            - aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
      description: The mandate this purchase was made under.
      examples:
        - id: edd288bc-42d0-41d3-9b87-14915f3ff2c6
          request: A black hoodie in size M under $80
          intent:
            item: hoodie
            category: hoodie
            quantity: 1
            maxPrice: 80
            currency: USD
            attributes:
              size: M
              color: black
            gender: male
            brands:
              - Under Armour
            deadline: 2026-11-01
            notes: Prefer cotton.
            mustAsk: []
          status: FULFILLED
          shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
    EventChain:
      type: object
      required:
        - intact
        - events
      properties:
        intact:
          type: boolean
          description: Every hash links correctly.
          examples:
            - true
        events:
          type: array
          items:
            $ref: "#/components/schemas/ChainEvent"
          description: Events, oldest first.
          examples:
            - - seq: 0
                type: MANDATE_SIGNED
                createdAt: 2026-10-20T04:18:18.268Z
                hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
                proof:
                  kind: signature
                  how: Ed25519 signature from the shopper's device verified against the mandate's
                    exact bytes.
                  ref: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
      description: The mandate's event chain, with a proof on every step.
      examples:
        - intact: true
          events:
            - seq: 0
              type: MANDATE_SIGNED
              createdAt: 2026-10-20T04:18:18.268Z
              hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
              proof:
                kind: signature
                how: Ed25519 signature from the shopper's device verified against the mandate's
                  exact bytes.
                ref: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
    ChainEvent:
      type: object
      required:
        - seq
        - type
        - createdAt
        - hash
        - proof
      properties:
        seq:
          type: integer
          description: Position in the hash chain, starting at 0.
          examples:
            - 0
        type:
          type: string
          description: Event type, for example MANDATE_SIGNED or PAYMENT_VOIDED.
          examples:
            - MANDATE_SIGNED
        createdAt:
          type: string
          format: date-time
          description: When it was created (ISO 8601, UTC).
          examples:
            - 2026-10-20T04:18:18.268Z
        hash:
          type: string
          description: SHA-256 of this event chained to the previous event's hash.
          examples:
            - 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
        proof:
          type: object
          description: How this step was decided, and the PayPal call or id behind it.
          additionalProperties: true
          examples:
            - kind: signature
              how: Ed25519 signature from the shopper's device verified against the mandate's
                exact bytes.
              ref: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
      description: One event in the hash chain, with the proof of how it was decided.
      examples:
        - seq: 0
          type: MANDATE_SIGNED
          createdAt: 2026-10-20T04:18:18.268Z
          hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
          proof:
            kind: signature
            how: Ed25519 signature from the shopper's device verified against the mandate's
              exact bytes.
            ref: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
    IntentDraft:
      type: object
      description: The shopper's limits in structured form.
      required:
        - item
        - maxPrice
      properties:
        item:
          type: string
          maxLength: 120
          description: What to buy, as a short noun phrase.
          examples:
            - hoodie
        category:
          type: string
          maxLength: 60
          description: Product category in plain words.
          examples:
            - hoodie
        quantity:
          type: integer
          minimum: 1
          maximum: 20
          default: 1
          description: How many to buy.
          examples:
            - 1
        maxPrice:
          type: number
          minimum: 0
          description: Ceiling per item; 0 means no budget was given.
          examples:
            - 80
        currency:
          type: string
          minLength: 3
          maxLength: 3
          default: USD
          description: Currency of maxPrice.
          examples:
            - USD
        attributes:
          type: object
          description: Required attribute values, keys lowercase.
          additionalProperties:
            type: string
            description: The value for one key in attributes.
            examples:
              - M
          examples:
            - size: M
              color: black
        gender:
          $ref: "#/components/schemas/Gender"
        brands:
          type: array
          maxItems: 10
          items:
            type: string
            description: One entry in brands.
            examples:
              - Under Armour
          description: Only these brands, if the shopper named any.
          examples:
            - - Under Armour
        deadline:
          type: string
          description: ISO date the item must arrive by.
          examples:
            - 2026-11-01
        notes:
          type: string
          maxLength: 300
          description: Soft preferences that are not hard limits.
          examples:
            - Prefer cotton.
        mustAsk:
          type: array
          maxItems: 5
          description: Questions to answer before the draft can be signed.
          items:
            type: string
            description: One entry in mustAsk.
            examples:
              - What size?
          examples:
            - []
      examples:
        - item: black hoodie
          category: hoodie
          quantity: 1
          maxPrice: 80
          currency: USD
          attributes:
            color: black
            size: M
          mustAsk: []
    Gender:
      type: string
      enum:
        - male
        - female
      description: Men's or women's products.
      examples:
        - male
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
    OrderStatus:
      type: string
      enum:
        - CHECKOUT_CREATED
        - CANCELLED
        - AUTHORIZED
        - VOIDED
        - CAPTURED
        - REFUNDED
        - PARTIALLY_REFUNDED
        - CLAIM_OPEN
        - RETURN_PENDING
        - REVIEW
        - DISPUTED
        - FAILED
      description: Where an order stands. AUTHORIZED means the money is only held and
        Undo is a free void.
      examples:
        - AUTHORIZED
    Product:
      type: object
      required:
        - channel3Id
        - title
        - price
        - currency
        - sourceUrl
        - sourceDomain
        - colors
        - attributes
        - variant
        - variantOptions
      properties:
        channel3Id:
          type: string
          description: Catalog product id. Use it with getProduct.
          examples:
            - w25336I
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
        description:
          type:
            - string
            - "null"
          description: Product description from the retailer, when there is one.
          examples:
            - These men's running shoes from Under Armour, the UA Infinite Pro,
              are designed for endurance with a focus on comfort and support.
              They feature a breathable e…
        price:
          type: number
          description: Price of the chosen offer, per item.
          examples:
            - 116.97
        currency:
          type: string
          description: ISO 4217 currency code.
          examples:
            - USD
        imageUrl:
          type:
            - string
            - "null"
          description: Product image URL, when there is one.
          examples:
            - https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5D44F1Y9VDE34RVPPTF1H15&mid=oKaH
        sourceUrl:
          type: string
          description: Where the product is sold.
          examples:
            - https://buy.trychannel3.com/w25336I-oKaH-Wqce8l?o=01KVATPXMQW09XVTMRDEW2Q1Y9&aid=01M5D44F1Y9VDE34RVPPTF1H15
        sourceDomain:
          type: string
          description: The retailer's domain.
          examples:
            - underarmour.com
        colors:
          type: array
          items:
            type: string
            description: One entry in colors.
            examples:
              - "#1e1e20"
          description: Colors of the product as hex codes.
          examples:
            - - "#1e1e20"
              - "#d5d4d8"
        attributes:
          type: object
          additionalProperties: true
          description: "Catalog attributes. Each value is a list of strings, for example
            activity: [Running]."
          examples:
            - activity:
                - Running
              pattern:
                - Texture
                - Geometric
              closure-type:
                - Straps
                - Lace-up
              heel-height-type:
                - Flat
                - Low
              footwear-material:
                - Mesh
                - Polyester
              shoe-fit:
                - Regular
              shoe-features:
                - Breathable design
                - Cushioned
              toe-style:
                - Round
              outsole-material:
                - Rubber
              footwear-support-type:
                - Neutral
                - Stability
              lining-material:
                - Synthetic
        variant:
          type: object
          description: The exact variant this offer resolves to, for example Size M and
            Color Black.
          additionalProperties:
            type: string
            description: The value for one key in variant.
            examples:
              - "10.5"
          examples:
            - Size: "10.5"
        variantOptions:
          type: array
          items:
            $ref: "#/components/schemas/VariantOption"
          description: Every option the product comes in, with its values.
          examples:
            - - name: Color
                values:
                  - Black
                  - White
              - name: Size
                values:
                  - "7"
                  - "8"
      description: A catalog product resolved to one offer and one exact variant.
      examples:
        - channel3Id: w25336I
          title: UA Infinite Pro Men's Running Shoes
          brand: Under Armour
          description: These men's running shoes from Under Armour, the UA Infinite Pro,
            are designed for endurance with a focus on comfort and support. They
            feature a breathable e…
          price: 116.97
          currency: USD
          imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5D44F1Y9VDE34RVPPTF1H15&mid=oKaH
          sourceUrl: https://buy.trychannel3.com/w25336I-oKaH-Wqce8l?o=01KVATPXMQW09XVTMRDEW2Q1Y9&aid=01M5D44F1Y9VDE34RVPPTF1H15
          sourceDomain: underarmour.com
          colors:
            - "#1e1e20"
            - "#d5d4d8"
          attributes:
            activity:
              - Running
            pattern:
              - Texture
              - Geometric
            closure-type:
              - Straps
              - Lace-up
            heel-height-type:
              - Flat
              - Low
            footwear-material:
              - Mesh
              - Polyester
            shoe-fit:
              - Regular
            shoe-features:
              - Breathable design
              - Cushioned
            toe-style:
              - Round
            outsole-material:
              - Rubber
            footwear-support-type:
              - Neutral
              - Stability
            lining-material:
              - Synthetic
          variant:
            Size: "10.5"
          variantOptions:
            - name: Color
              values:
                - Black
                - White
            - name: Size
              values:
                - "7"
                - "8"
    PayPalIds:
      type: object
      properties:
        orderId:
          type:
            - string
            - "null"
          description: PayPal Orders v2 id.
          examples:
            - edd288bc-42d0-41d3-9b87-14915f3ff2c6
        authorizationId:
          type:
            - string
            - "null"
          description: PayPal authorization id, once the money is held.
          examples:
            - 4LD43914UL8743542
        captureId:
          type:
            - string
            - "null"
          description: PayPal capture id, once the money is taken.
          examples:
            - 4087729233507714F
      description: The PayPal ids behind this order.
      examples:
        - orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
          authorizationId: 4LD43914UL8743542
          captureId: 4087729233507714F
    VariantOption:
      type: object
      required:
        - name
        - values
      properties:
        name:
          type: string
          description: Option name, for example Size.
          examples:
            - Size
        values:
          type: array
          items:
            type: string
            description: One entry in values.
            examples:
              - "10.5"
          description: Available values, for example S, M, L.
          examples:
            - - "10.5"
      description: One option a product comes in, with its values.
      examples:
        - name: Size
          values:
            - "10.5"
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
info:
  title: Undo API
  version: 1.0.0
```