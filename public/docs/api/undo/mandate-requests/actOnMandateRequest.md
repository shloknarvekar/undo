# Answer, prepare or sign a mandate request (/docs/api/undo/mandate-requests/actOnMandateRequest)

`POST /api/mandate-requests/{requestId}`

- `answer`: answers the agent's open questions; the draft is re-read from the new text.
- `prepare`: the exact mandate this device's key must sign.
- `sign`: stores the signed mandate; it must match the request byte for byte (same words, limits and agent).


```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/mandate-requests/{requestId}:
    post:
      tags:
        - Mandate requests
      operationId: actOnMandateRequest
      summary: Answer, prepare or sign a mandate request
      description: >
        - `answer`: answers the agent's open questions; the draft is re-read
        from the new text.

        - `prepare`: the exact mandate this device's key must sign.

        - `sign`: stores the signed mandate; it must match the request byte for
        byte (same words, limits and agent).
      parameters:
        - $ref: "#/components/parameters/RequestId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/MandateRequestAction"
            examples:
              default:
                value:
                  action: answer
                  answers:
                    What size?: M
        description: The shopper's answer, a request to prepare the mandate, or the
          signed mandate.
      responses:
        "200":
          description: Answered (new draft) or prepared (mandate and signing message).
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MandateRequestActionResult"
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
                      agent:
                        name: Claude
                        verified: false
                    signingMessage: undo-intent-mandate-v1:7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
        "201":
          description: Signed and stored.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MandateRequestSigned"
              examples:
                default:
                  value:
                    mandateId: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
                    digest: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
        "400":
          $ref: "#/components/responses/InvalidRequest"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"
        "422":
          $ref: "#/components/responses/Unprocessable"
        "429":
          $ref: "#/components/responses/RateLimited"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: >-
              try

              {
                  var response = await client.MandateRequests.ActOnMandateRequest(
                      new ActOnMandateRequest
                      {
                          RequestId = Guid.Parse(
                              "7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"),
                          Body = new AnswerAction
                          {
                              Answers = new Dictionary<string, string>
                              {
                                  ["What size?"] = "M",
                              },
                          },
                      });
                  // TODO: Handle 'response' of type MandateRequestActionResult
              }

              catch (ApiException<ActOnMandateRequestError> ex)

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
                  response = client.mandate_requests.act_on_mandate_request(
                      UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"),
                      AnswerAction(
                          action="answer", answers={"What size?": "M"}
                      ),
                  )
                  # TODO: Handle 'response' of type
                  # MandateRequestActionResult
              except ApiError as e:
                  # TODO: Handle 'e.error' of type
                  # ActOnMandateRequestErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response =
                  await client.mandateRequests.actOnMandateRequest({
                    requestId: "7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d",
                    body: {
                      action: "answer",
                      answers: { "What size?": "M" },
                    },
                  });
                // TODO: Handle 'response' of type MandateRequestActionResult
              } catch (err) {
                // TODO: Handle 'err' of type MandateRequests.ActOnMandateRequestError, discriminated with 'err.payload.kind'
              }
components:
  parameters:
    RequestId:
      name: requestId
      in: path
      required: true
      description: Mandate request id.
      schema:
        type: string
        format: uuid
        description: Mandate request id.
        examples:
          - 7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d
  schemas:
    MandateRequestAction:
      oneOf:
        - $ref: "#/components/schemas/AnswerAction"
        - $ref: "#/components/schemas/PrepareAction"
        - $ref: "#/components/schemas/SignAction"
      discriminator:
        propertyName: action
        mapping:
          answer: "#/components/schemas/AnswerAction"
          prepare: "#/components/schemas/PrepareAction"
          sign: "#/components/schemas/SignAction"
      description: One of answer, prepare or sign, chosen by action.
      examples:
        - action: answer
          answers:
            What size?: M
    MandateRequestActionResult:
      oneOf:
        - $ref: "#/components/schemas/DraftResult"
        - $ref: "#/components/schemas/PreparedMandate"
      description: The new draft after answer, or the mandate to sign after prepare.
      examples:
        - draft:
            item: black hoodie
            category: hoodie
            quantity: 1
            maxPrice: 80
            currency: USD
            attributes:
              color: black
              size: M
            mustAsk: []
          ready:
            ok: true
    MandateRequestSigned:
      type: object
      required:
        - mandateId
        - digest
      properties:
        mandateId:
          type: string
          format: uuid
          description: The stored mandate's id.
          examples:
            - 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
        digest:
          type: string
          description: SHA-256 of the canonical mandate.
          examples:
            - 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
      description: A mandate request that was signed and stored.
      examples:
        - mandateId: 2f4069f0-2367-4f08-acc6-d9cf1cf6669a
          digest: 7bf66d54681f2b73e2f05ee0d49b5a68776908620751daaf0102b9f0b17fcac6
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
    DraftResult:
      type: object
      required:
        - draft
        - ready
      properties:
        request:
          type: string
          description: The request text, when it was extended with answers.
          examples:
            - A black hoodie in size M under $80
        draft:
          $ref: "#/components/schemas/IntentDraft"
        ready:
          $ref: "#/components/schemas/ReadyCheck"
      description: A structured draft of the shopper's limits, ready for review.
      examples:
        - draft:
            item: black hoodie
            category: hoodie
            quantity: 1
            maxPrice: 80
            currency: USD
            attributes:
              color: black
              size: M
            mustAsk: []
          ready:
            ok: true
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
    ReadyCheck:
      type: object
      required:
        - ok
      properties:
        ok:
          type: boolean
          description: True when the draft can be signed as is.
          examples:
            - false
        reason:
          $ref: "#/components/schemas/NotReadyReason"
      description: Whether a draft can be signed as is.
      examples:
        - ok: false
          reason: open_questions
    NotReadyReason:
      type: string
      enum:
        - open_questions
        - missing_budget
      description: Why a draft can't be signed yet.
      examples:
        - open_questions
    AnswerAction:
      type: object
      required:
        - action
        - answers
      properties:
        action:
          $ref: "#/components/schemas/AnswerActionName"
        answers:
          type: object
          description: Each open question (exactly as asked) mapped to the shopper's answer.
          additionalProperties:
            type: string
            maxLength: 200
            description: The value for one key in answers.
            examples:
              - M
          examples:
            - What size?: M
      description: Answer the agent's open questions.
      examples:
        - action: answer
          answers:
            What size?: M
    PrepareAction:
      type: object
      required:
        - action
        - shopperKey
      properties:
        action:
          $ref: "#/components/schemas/PrepareActionName"
        shopperKey:
          type: string
          minLength: 40
          maxLength: 60
          description: Base64 Ed25519 public key of the device that will sign.
          examples:
            - aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
        payWith:
          $ref: "#/components/schemas/PayWith"
      description: Build the exact mandate this device will sign.
      examples:
        - action: prepare
          shopperKey: aHBQ5B27O2BiDV0oWgOigpsXZKjOfhcYYMch5pZ5H0c=
    SignAction:
      type: object
      required:
        - action
        - mandate
        - signature
      properties:
        action:
          $ref: "#/components/schemas/SignActionName"
        mandate:
          $ref: "#/components/schemas/IntentMandate"
        signature:
          type: string
          minLength: 80
          maxLength: 100
          description: Base64 Ed25519 signature of the signingMessage returned by prepare.
          examples:
            - derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
      description: Store the signed mandate.
      examples:
        - action: sign
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
    SignActionName:
      type: string
      enum:
        - sign
      description: Always sign.
      examples:
        - sign
    PrepareActionName:
      type: string
      enum:
        - prepare
      description: Always prepare.
      examples:
        - prepare
    AnswerActionName:
      type: string
      enum:
        - answer
      description: Always answer.
      examples:
        - answer
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
info:
  title: Undo API
  version: 1.0.0
```