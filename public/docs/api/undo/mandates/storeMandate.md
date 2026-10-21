# Store a signed mandate (/docs/api/undo/mandates/storeMandate)

`POST /api/mandates`

Re-verifies the signature, freshness, expiry and readiness, then writes the first event of the mandate's hash chain.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/mandates:
    post:
      tags:
        - Mandates
      operationId: storeMandate
      summary: Store a signed mandate
      description: Re-verifies the signature, freshness, expiry and readiness, then
        writes the first event of the mandate's hash chain.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SignedMandate"
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
                  signature: derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
        description: The mandate and the shopper's signature over it.
      responses:
        "201":
          description: Stored.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StoredMandate"
              examples:
                default:
                  value:
                    id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                    digest: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
                    event:
                      seq: 0
                      hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
        "400":
          $ref: "#/components/responses/InvalidRequest"
        "403":
          $ref: "#/components/responses/Forbidden"
        "409":
          $ref: "#/components/responses/Conflict"
        "422":
          $ref: "#/components/responses/Unprocessable"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: >-
              try

              {
                  var response = await client.Mandates.StoreMandate(
                      new StoreMandateRequest
                      {
                          Body = new SignedMandate
                          {
                              Mandate = new IntentMandate
                              {
                                  Version = 1,
                                  Id = Guid.Parse(
                                      "2f4069f0-2367-4f08-acc6-d9cf1cf6669a"),
                                  CreatedAt = DateTimeOffset.Parse(
                                      "2026-10-20T04:18:17.928Z"),
                                  ExpiresAt = DateTimeOffset.Parse(
                                      "2026-11-03T04:18:17.928Z"),
                                  ShopperKey = "aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
                                  Request = "Buy me black men's running shoes, size 10, under $120",
                                  Intent = new IntentDraft
                                  {
                                      Item = "running shoes",
                                      Category = "running shoes",
                                      Quantity = 1,
                                      MaxPrice = 120d,
                                      Currency = "USD",
                                      Attributes = new Dictionary<string, string>
                                      {
                                          ["size"] = "10",
                                          ["color"] = "black",
                                      },
                                      Gender = Gender.Male,
                                      MustAsk = [],
                                  },
                              },
                              Signature = "derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
                          },
                      });
                  // TODO: Handle 'response' of type StoredMandate
              }

              catch (ApiException<StoreMandateError> ex)

              {
                  if (ex.Error.TryGetError(out var error))
                  {
                      // TODO: Handle 'error' of type Error
                  }
              }
        - lang: python
          label: Python
          sources:
            Example: >-
              try:
                  response = client.mandates.store_mandate(
                      SignedMandate(
                          mandate=IntentMandate(
                              version=1,
                              id=UUID(
                                  "2f4069f0-2367-4f08-acc6-d9cf1cf6669a"
                              ),
                              created_at=datetime(
                                  2026,
                                  10,
                                  20,
                                  4,
                                  18,
                                  17,
                                  928000,
                                  tzinfo=timezone.utc,
                              ),
                              expires_at=datetime(
                                  2026,
                                  11,
                                  3,
                                  4,
                                  18,
                                  17,
                                  928000,
                                  tzinfo=timezone.utc,
                              ),
                              shopper_key="aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
                              request="Buy me black men's running shoes, size 10, under $120",
                              intent=IntentDraft(
                                  item="running shoes",
                                  category="running shoes",
                                  quantity=1,
                                  max_price=120,
                                  currency="USD",
                                  attributes={
                                      "size": "10", "color": "black"
                                  },
                                  gender=Gender.MALE,
                                  must_ask=[],
                              ),
                          ),
                          signature="derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
                      ),
                  )
                  # TODO: Handle 'response' of type StoredMandate
              except ApiError as e:
                  # TODO: Handle 'e.error' of type StoreMandateErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.mandates.storeMandate({
                  body: {
                    mandate: {
                      version: 1,
                      id: "2f4069f0-2367-4f08-acc6-d9cf1cf6669a",
                      createdAt: new Date(
                        Date.UTC(2026, 9, 20, 4, 18, 17, 928),
                      ),
                      expiresAt: new Date(
                        Date.UTC(2026, 10, 3, 4, 18, 17, 928),
                      ),
                      shopperKey:
                        "aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
                      request:
                        "Buy me black men's running shoes, size 10, under $120",
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
                    signature:
                      "derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
                  },
                });
                // TODO: Handle 'response' of type StoredMandate
              } catch (err) {
                // TODO: Handle 'err' of type Mandates.StoreMandateError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    SignedMandate:
      type: object
      required:
        - mandate
        - signature
      properties:
        mandate:
          $ref: "#/components/schemas/IntentMandate"
        signature:
          type: string
          minLength: 80
          maxLength: 100
          description: Base64 Ed25519 signature of the signing message.
          examples:
            - derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
      description: A mandate and the shopper's signature over its signing message.
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
          signature: derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
    StoredMandate:
      type: object
      required:
        - id
        - digest
        - event
      properties:
        id:
          type: string
          format: uuid
          description: The stored mandate's id.
          examples:
            - 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
        digest:
          type: string
          description: SHA-256 (hex) of the mandate's canonical JSON.
          examples:
            - 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
        event:
          $ref: "#/components/schemas/ChainEventRef"
      description: A stored mandate and the first event of its hash chain.
      examples:
        - id: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
          digest: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
          event:
            seq: 0
            hash: 91b50424c310c5106b3c9873427ada9d3ffccf45c9834d1c2df342316b5a25d8
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
    ChainEventRef:
      type: object
      required:
        - seq
        - hash
      properties:
        seq:
          type: integer
          description: Position in the hash chain, starting at 0.
          examples:
            - 1
        hash:
          type: string
          description: SHA-256 of this event chained to the previous event's hash.
          examples:
            - 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
      description: The first event in the mandate's hash chain (MANDATE_SIGNED).
      examples:
        - seq: 1
          hash: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
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
    InvalidRequest:
      description: The body failed validation; `issues` lists each problem.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          examples:
            default:
              value:
                error: invalid_request
                issues:
                  - code: too_small
                    message: String must contain at least 3 character(s)
                    path:
                      - request
    Forbidden:
      description: Refused, for example a bad signature.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          examples:
            default:
              value:
                error: bad_signature
    Conflict:
      description: The resource is not in a state that allows this.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          examples:
            default:
              value:
                error: not_undoable
                status: VOIDED
    Unprocessable:
      description: Valid shape, but the content can't be accepted.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          examples:
            default:
              value:
                error: stale_request
info:
  title: Undo API
  version: 1.0.0
```