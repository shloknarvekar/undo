# Get a mandate and check its integrity (/docs/api/undo/mandates/getMandate)

`GET /api/mandates/{mandateId}`

The mandate, its status, the search it permits, and a fresh check of its digest, signature and event chain.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/mandates/{mandateId}:
    get:
      tags:
        - Mandates
      operationId: getMandate
      summary: Get a mandate and check its integrity
      description: The mandate, its status, the search it permits, and a fresh check
        of its digest, signature and event chain.
      parameters:
        - $ref: "#/components/parameters/MandateId"
      responses:
        "200":
          description: The mandate with a live integrity check.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MandateView"
              examples:
                default:
                  value:
                    mandate:
                      version: 1
                      id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                      createdAt: 2026-10-20T04:18:17.928Z
                      expiresAt: 2026-11-03T04:18:17.928Z
                      shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
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
                    search:
                      query: black running shoes
                      category: running shoes
                      maxPrice: 120
                      color: black
                      gender: male
                    integrity:
                      digestMatches: true
                      signatureValid: true
                      chainIntact: true
                    events:
                      - seq: 0
                        type: MANDATE_SIGNED
                        createdAt: 2026-10-20T04:18:18.268Z
                        hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
                      - seq: 1
                        type: CART_PROPOSED
                        createdAt: 2026-10-20T04:18:18.832Z
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
                  var response = await client.Mandates.GetMandate(
                      new GetMandateRequest
                      {
                          MandateId = Guid.Parse(
                              "2f4069f0-2367-4f08-acc6-d9cf1cf6669a"),
                      });
                  // TODO: Handle 'response' of type MandateView
              }
              catch (ApiException<GetMandateError> ex)
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
                  response = client.mandates.get_mandate(
                      UUID("2f4069f0-2367-4f08-acc6-d9cf1cf6669a")
                  )
                  # TODO: Handle 'response' of type MandateView
              except ApiError as e:
                  # TODO: Handle 'e.error' of type GetMandateErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.mandates.getMandate({
                  mandateId: "2f4069f0-2367-4f08-acc6-d9cf1cf6669a",
                });
                // TODO: Handle 'response' of type MandateView
              } catch (err) {
                // TODO: Handle 'err' of type Mandates.GetMandateError, discriminated with 'err.payload.kind'
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
    MandateView:
      type: object
      required:
        - mandate
        - status
        - search
        - integrity
        - events
      properties:
        mandate:
          $ref: "#/components/schemas/IntentMandate"
        status:
          $ref: "#/components/schemas/MandateStatus"
        search:
          type: object
          description: The product search this mandate permits.
          additionalProperties: true
          examples:
            - query: black running shoes
              category: running shoes
              maxPrice: 120
              color: black
              gender: male
        integrity:
          $ref: "#/components/schemas/IntegrityCheck"
        events:
          type: array
          items:
            $ref: "#/components/schemas/ChainEventSummary"
          description: The mandate's event chain, oldest first.
          examples:
            - - seq: 0
                type: MANDATE_SIGNED
                createdAt: 2026-10-20T04:18:18.268Z
                hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
              - seq: 1
                type: CART_PROPOSED
                createdAt: 2026-10-20T04:18:18.832Z
                hash: 89f7646662727852af27cbdf1e326a17b6cc76c2bd462031bbf8f1f29622e323
      description: A mandate with its status, the search it permits, and a fresh
        integrity check.
      examples:
        - mandate:
            version: 1
            id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
            createdAt: 2026-10-20T04:18:17.928Z
            expiresAt: 2026-11-03T04:18:17.928Z
            shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
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
          search:
            query: black running shoes
            category: running shoes
            maxPrice: 120
            color: black
            gender: male
          integrity:
            digestMatches: true
            signatureValid: true
            chainIntact: true
          events:
            - seq: 0
              type: MANDATE_SIGNED
              createdAt: 2026-10-20T04:18:18.268Z
              hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
            - seq: 1
              type: CART_PROPOSED
              createdAt: 2026-10-20T04:18:18.832Z
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
    IntentMandate:
      type: object
      description: What the shopper signs. Its canonical JSON (sorted keys) is hashed
        with SHA-256 for the signing message.
      required:
        - version
        - id
        - createdAt
        - expiresAt
        - shopperKey
        - request
        - intent
      properties:
        version:
          type: integer
          minimum: 1
          maximum: 1
          description: Mandate format version. Always 1.
          examples:
            - 1
        id:
          type: string
          format: uuid
          description: Mandate id, chosen when it was prepared.
          examples:
            - 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
        createdAt:
          type: string
          format: date-time
          description: When the mandate was prepared.
          examples:
            - 2026-10-20T04:18:17.928Z
        expiresAt:
          type: string
          format: date-time
          description: When the mandate stops working (14 days after it was prepared).
          examples:
            - 2026-11-03T04:18:17.928Z
        shopperKey:
          type: string
          description: Base64 Ed25519 public key (32 bytes).
          examples:
            - aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
        request:
          type: string
          maxLength: 1000
          description: The shopper's own words, verbatim.
          examples:
            - Buy me black men's running shoes, size 10, under $120
        intent:
          $ref: "#/components/schemas/IntentDraft"
        agent:
          $ref: "#/components/schemas/AgentRef"
        payWith:
          $ref: "#/components/schemas/PayWith"
      examples:
        - version: 1
          id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
          createdAt: 2026-10-20T04:18:17.928Z
          expiresAt: 2026-11-03T04:18:17.928Z
          shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
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
    MandateStatus:
      type: string
      enum:
        - ACTIVE
        - FULFILLED
        - REVOKED
        - EXPIRED
      description: Where a mandate stands.
      examples:
        - ACTIVE
    IntegrityCheck:
      type: object
      required:
        - digestMatches
        - signatureValid
        - chainIntact
      properties:
        digestMatches:
          type: boolean
          description: The stored digest matches the mandate recomputed now.
          examples:
            - true
        signatureValid:
          type: boolean
          description: The shopper's signature verifies against the mandate.
          examples:
            - true
        chainIntact:
          type: boolean
          description: Every event's hash links correctly to the one before.
          examples:
            - true
        chainBrokenAt:
          type: integer
          description: The first event whose hash doesn't link, when the chain is broken.
          examples:
            - 4
      description: A fresh check, run on every read.
      examples:
        - digestMatches: true
          signatureValid: true
          chainIntact: true
          chainBrokenAt: 4
    ChainEventSummary:
      type: object
      required:
        - seq
        - type
        - createdAt
        - hash
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
      description: One event in a mandate's hash chain, without its payload.
      examples:
        - seq: 0
          type: MANDATE_SIGNED
          createdAt: 2026-10-20T04:18:18.268Z
          hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
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
    AgentRef:
      type: object
      required:
        - name
        - verified
      properties:
        name:
          type: string
          maxLength: 80
          description: The agent's name as it introduced itself.
          examples:
            - Claude
        verified:
          type: boolean
          description: The agent presented a registered operator key.
          examples:
            - false
      description: The agent a mandate authorizes. Inside the signed bytes, so
        liability follows the name.
      examples:
        - name: Claude
          verified: false
    PayWith:
      type: string
      enum:
        - saved_wallet
      description: How the agent may pay.
      examples:
        - saved_wallet
    Gender:
      type: string
      enum:
        - male
        - female
      description: Men's or women's products.
      examples:
        - male
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