# Build the exact mandate to sign (/docs/api/undo/mandates/prepareMandate)

`POST /api/mandates/prepare`

Returns the mandate the shopper's device must sign and the exact `signingMessage`
(`undo-intent-mandate-v1:<sha256 of the canonical mandate JSON>`). Stateless; nothing is stored.


```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/mandates/prepare:
    post:
      tags:
        - Mandates
      operationId: prepareMandate
      summary: Build the exact mandate to sign
      description: >
        Returns the mandate the shopper's device must sign and the exact
        `signingMessage`

        (`undo-intent-mandate-v1:<sha256 of the canonical mandate JSON>`).
        Stateless; nothing is stored.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PrepareMandate"
            examples:
              default:
                value:
                  request: A black hoodie in size M under $80
                  draft:
                    item: black hoodie
                    category: hoodie
                    quantity: 1
                    maxPrice: 80
                    currency: USD
                    attributes:
                      color: black
                      size: M
                    mustAsk: []
                  shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
        description: The draft, the shopper's words and the device key that will sign.
      responses:
        "200":
          description: The mandate and the string to sign.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PreparedMandate"
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
                    signingMessage: undo-intent-mandate-v1:7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
        "400":
          $ref: "#/components/responses/InvalidRequest"
        "422":
          description: The draft still has open questions or no budget.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/NotReady"
              examples:
                default:
                  value:
                    error: open_questions
                    mustAsk:
                      - What size?
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: >-
              try

              {
                  var response = await client.Mandates.PrepareMandate(
                      new PrepareMandateRequest
                      {
                          Body = new PrepareMandate
                          {
                              Request = "A black hoodie in size M under $80",
                              Draft = new IntentDraft
                              {
                                  Item = "black hoodie",
                                  Category = "hoodie",
                                  Quantity = 1,
                                  MaxPrice = 80d,
                                  Currency = "USD",
                                  Attributes = new Dictionary<string, string>
                                  {
                                      ["color"] = "black",
                                      ["size"] = "M",
                                  },
                                  MustAsk = [],
                              },
                              ShopperKey = "aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
                          },
                      });
                  // TODO: Handle 'response' of type PreparedMandate
              }

              catch (ApiException<PrepareMandateError> ex)

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
                  # TODO: Handle 'e.error' of type PrepareMandateErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
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
                    shopperKey:
                      "aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=",
                  },
                });
                // TODO: Handle 'response' of type PreparedMandate
              } catch (err) {
                // TODO: Handle 'err' of type Mandates.PrepareMandateError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    PrepareMandate:
      type: object
      required:
        - request
        - draft
        - shopperKey
      properties:
        request:
          type: string
          minLength: 3
          maxLength: 1000
          description: The shopper's request in their own words, kept verbatim inside the
            mandate.
          examples:
            - A black hoodie in size M under $80
        draft:
          $ref: "#/components/schemas/IntentDraft"
        shopperKey:
          type: string
          minLength: 40
          maxLength: 60
          description: Base64 Ed25519 public key.
          examples:
            - aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
        payWith:
          $ref: "#/components/schemas/PayWith"
      description: What's needed to build the exact mandate a device will sign.
      examples:
        - request: A black hoodie in size M under $80
          draft:
            item: black hoodie
            category: hoodie
            quantity: 1
            maxPrice: 80
            currency: USD
            attributes:
              color: black
              size: M
            mustAsk: []
          shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
    PreparedMandate:
      type: object
      required:
        - mandate
        - signingMessage
      properties:
        mandate:
          $ref: "#/components/schemas/IntentMandate"
        signingMessage:
          type: string
          description: Sign these exact UTF-8 bytes with the shopper's Ed25519 key.
          examples:
            - undo-intent-mandate-v1:3f1c0e9a…
      description: The mandate to sign and the exact string to sign.
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
          signingMessage: undo-intent-mandate-v1:7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
    NotReady:
      type: object
      required:
        - error
      properties:
        error:
          $ref: "#/components/schemas/NotReadyReason"
        mustAsk:
          type: array
          items:
            type: string
            description: One entry in mustAsk.
            examples:
              - What size?
          description: The questions still to answer.
          examples:
            - []
      description: The draft can't be turned into a mandate yet.
      examples:
        - error: missing_budget
          mustAsk: []
    NotReadyReason:
      type: string
      enum:
        - open_questions
        - missing_budget
      description: Why a draft can't be signed yet.
      examples:
        - open_questions
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
info:
  title: Undo API
  version: 1.0.0
```