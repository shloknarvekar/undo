# Download the evidence for an order (/docs/api/undo/orders/getOrderEvidence)

`GET /api/orders/{orderId}/evidence`

Everything needed to check an order without trusting Undo: the raw hash-chained events exactly as hashed and
the signed mandate exactly as stored. Nothing is pre-verified, on purpose.


```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/orders/{orderId}/evidence:
    get:
      tags:
        - Orders
      operationId: getOrderEvidence
      summary: Download the evidence for an order
      description: >
        Everything needed to check an order without trusting Undo: the raw
        hash-chained events exactly as hashed and

        the signed mandate exactly as stored. Nothing is pre-verified, on
        purpose.
      parameters:
        - $ref: "#/components/parameters/OrderId"
      responses:
        "200":
          description: The evidence file (`undo-evidence-v1`).
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Evidence"
              examples:
                default:
                  value:
                    format: undo-evidence-v1
                    orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
                    mandate:
                      id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                      intent:
                        item: running shoes
                        gender: male
                        mustAsk: []
                        category: running shoes
                        currency: USD
                        maxPrice: 120
                        quantity: 1
                        attributes:
                          size: "10"
                          color: black
                      request: Buy me black men's running shoes, size 10, under $120
                      version: 1
                      createdAt: 2026-10-20T04:18:17.928Z
                      expiresAt: 2026-11-03T04:18:17.928Z
                      shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
                    events:
                      - subjectId: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                        seq: 0
                        type: MANDATE_SIGNED
                        payload:
                          digest: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
                          signature: derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
                        createdAt: 2026-10-20T04:18:18.268Z
                        prevHash: "0000000000000000000000000000000000000000000000000000000000000000"
                        hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
                      - subjectId: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                        seq: 1
                        type: CART_PROPOSED
                        payload:
                          risk:
                            factors:
                              - factor: order total $116.97
                                minutes: 360
                              - factor: agent bypassed Undo's pre-purchase check
                                minutes: 720
                            minutes: 1080
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
                          orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
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
                              are designed for endurance with a focus on comfort
                              and support. They feature a breathable e…
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
                          quantity: 1
                        createdAt: 2026-10-20T04:18:18.832Z
                        prevHash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
                        hash: 89f7646662727852af27cbdf1e326a17b6cc76c2bd462031bbf8f1f29622e323
        "404":
          $ref: "#/components/responses/NotFound"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Orders.GetOrderEvidence(
                      new GetOrderEvidenceRequest
                      {
                          OrderId = Guid.Parse(
                              "edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
                      });
                  // TODO: Handle 'response' of type Evidence
              }
              catch (ApiException<GetOrderEvidenceError> ex)
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
                  response = client.orders.get_order_evidence(
                      UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6")
                  )
                  # TODO: Handle 'response' of type Evidence
              except ApiError as e:
                  # TODO: Handle 'e.error' of type
                  # GetOrderEvidenceErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.orders.getOrderEvidence({
                  orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
                });
                // TODO: Handle 'response' of type Evidence
              } catch (err) {
                // TODO: Handle 'err' of type Orders.GetOrderEvidenceError, discriminated with 'err.payload.kind'
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
    Evidence:
      type: object
      required:
        - format
        - orderId
        - mandate
        - events
      properties:
        format:
          $ref: "#/components/schemas/EvidenceFormat"
        orderId:
          type: string
          format: uuid
          description: The order this evidence is for.
          examples:
            - edd288bc-42d0-41d3-9b87-14915f3ff2c6
        mandate:
          type:
            - object
            - "null"
          description: The signed mandate exactly as stored.
          additionalProperties: true
          examples:
            - id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
              intent:
                item: running shoes
                gender: male
                mustAsk: []
                category: running shoes
                currency: USD
                maxPrice: 120
                quantity: 1
                attributes:
                  size: "10"
                  color: black
              request: Buy me black men's running shoes, size 10, under $120
              version: 1
              createdAt: 2026-10-20T04:18:17.928Z
              expiresAt: 2026-11-03T04:18:17.928Z
              shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
        events:
          type: array
          description: Raw events exactly as hashed. Each hash covers the previous hash
            and the canonical payload.
          items:
            type: object
            additionalProperties: true
            description: One entry in events.
            examples:
              - subjectId: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                seq: 0
                type: MANDATE_SIGNED
                payload:
                  digest: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
                  signature: derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
                createdAt: 2026-10-20T04:18:18.268Z
                prevHash: "0000000000000000000000000000000000000000000000000000000000000000"
                hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
          examples:
            - - subjectId: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                seq: 0
                type: MANDATE_SIGNED
                payload:
                  digest: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
                  signature: derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
                createdAt: 2026-10-20T04:18:18.268Z
                prevHash: "0000000000000000000000000000000000000000000000000000000000000000"
                hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
              - subjectId: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                seq: 1
                type: CART_PROPOSED
                payload:
                  risk:
                    factors:
                      - factor: order total $116.97
                        minutes: 360
                      - factor: agent bypassed Undo's pre-purchase check
                        minutes: 720
                    minutes: 1080
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
                  orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
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
                  quantity: 1
                createdAt: 2026-10-20T04:18:18.832Z
                prevHash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
                hash: 89f7646662727852af27cbdf1e326a17b6cc76c2bd462031bbf8f1f29622e323
      description: Everything needed to verify an order without trusting Undo.
      examples:
        - format: undo-evidence-v1
          orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
          mandate:
            id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
            intent:
              item: running shoes
              gender: male
              mustAsk: []
              category: running shoes
              currency: USD
              maxPrice: 120
              quantity: 1
              attributes:
                size: "10"
                color: black
            request: Buy me black men's running shoes, size 10, under $120
            version: 1
            createdAt: 2026-10-20T04:18:17.928Z
            expiresAt: 2026-11-03T04:18:17.928Z
            shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
          events:
            - subjectId: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
              seq: 0
              type: MANDATE_SIGNED
              payload:
                digest: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
                signature: derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
              createdAt: 2026-10-20T04:18:18.268Z
              prevHash: "0000000000000000000000000000000000000000000000000000000000000000"
              hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
            - subjectId: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
              seq: 1
              type: CART_PROPOSED
              payload:
                risk:
                  factors:
                    - factor: order total $116.97
                      minutes: 360
                    - factor: agent bypassed Undo's pre-purchase check
                      minutes: 720
                  minutes: 1080
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
                orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
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
                quantity: 1
              createdAt: 2026-10-20T04:18:18.832Z
              prevHash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
              hash: 89f7646662727852af27cbdf1e326a17b6cc76c2bd462031bbf8f1f29622e323
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
    EvidenceFormat:
      type: string
      enum:
        - undo-evidence-v1
      description: Evidence file format.
      examples:
        - undo-evidence-v1
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