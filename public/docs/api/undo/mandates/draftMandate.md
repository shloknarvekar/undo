# Draft a mandate from the shopper's words (/docs/api/undo/mandates/draftMandate)

`POST /api/mandates/draft`

Turns a plain request into structured limits for the shopper to review. Nothing is stored. Rate limited per visitor.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/mandates/draft:
    post:
      tags:
        - Mandates
      operationId: draftMandate
      summary: Draft a mandate from the shopper's words
      description: Turns a plain request into structured limits for the shopper to
        review. Nothing is stored. Rate limited per visitor.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/DraftMandateRequest"
            examples:
              default:
                value:
                  request: A black hoodie in size M under $80
        description: The shopper's request in their own words.
      responses:
        "200":
          description: The draft and whether it can be signed as is.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DraftResult"
              examples:
                default:
                  value:
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
                    ready:
                      ok: true
        "400":
          $ref: "#/components/responses/InvalidRequest"
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
                  var response = await client.Mandates.DraftMandate(
                      new DraftMandateOperationRequest
                      {
                          Body = new DraftMandateRequest
                          {
                              Request = "A black hoodie in size M under $80",
                          },
                      });
                  // TODO: Handle 'response' of type DraftResult
              }
              catch (ApiException<DraftMandateError> ex)
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
                  response = client.mandates.draft_mandate(
                      DraftMandateRequest(
                          request="A black hoodie in size M under $80"
                      ),
                  )
                  # TODO: Handle 'response' of type DraftResult
              except ApiError as e:
                  # TODO: Handle 'e.error' of type DraftMandateErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.mandates.draftMandate({
                  body: { request: "A black hoodie in size M under $80" },
                });
                // TODO: Handle 'response' of type DraftResult
              } catch (err) {
                // TODO: Handle 'err' of type Mandates.DraftMandateError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    DraftMandateRequest:
      type: object
      required:
        - request
      properties:
        request:
          type: string
          minLength: 3
          maxLength: 1000
          description: The shopper's own words.
          examples:
            - A black hoodie in size M under $80
      description: The shopper's words to turn into a draft.
      examples:
        - request: A black hoodie in size M under $80
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