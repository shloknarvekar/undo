# Get a mandate request (/docs/api/undo/mandate-requests/getMandateRequest)

`GET /api/mandate-requests/{requestId}`

The draft an outside agent asked the shopper to sign, who is asking, and whether it is signed yet.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/mandate-requests/{requestId}:
    get:
      tags:
        - Mandate requests
      operationId: getMandateRequest
      summary: Get a mandate request
      description: The draft an outside agent asked the shopper to sign, who is
        asking, and whether it is signed yet.
      parameters:
        - $ref: "#/components/parameters/RequestId"
      responses:
        "200":
          description: The request.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MandateRequest"
              examples:
                default:
                  value:
                    id: 7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d
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
                    ready:
                      ok: true
                    agent:
                      name: Claude
                      verified: false
                    status: PENDING
                    mandateId: null
                    expiresAt: 2026-10-21T18:00:00.000Z
        "404":
          $ref: "#/components/responses/NotFound"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.MandateRequests.GetMandateRequest(
                      new GetMandateRequestOperationRequest
                      {
                          RequestId = Guid.Parse(
                              "7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d"),
                      });
                  // TODO: Handle 'response' of type MandateRequest
              }
              catch (ApiException<GetMandateRequestError> ex)
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
                  response = client.mandate_requests.get_mandate_request(
                      UUID("7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d")
                  )
                  # TODO: Handle 'response' of type MandateRequest
              except ApiError as e:
                  # TODO: Handle 'e.error' of type
                  # GetMandateRequestErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response =
                  await client.mandateRequests.getMandateRequest({
                    requestId: "7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d",
                  });
                // TODO: Handle 'response' of type MandateRequest
              } catch (err) {
                // TODO: Handle 'err' of type MandateRequests.GetMandateRequestError, discriminated with 'err.payload.kind'
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
    MandateRequest:
      type: object
      required:
        - id
        - request
        - draft
        - ready
        - agent
        - status
        - expiresAt
      properties:
        id:
          type: string
          format: uuid
          description: Mandate request id.
          examples:
            - 7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d
        request:
          type: string
          description: The request as the agent passed it on, plus any answers.
          examples:
            - A black hoodie in size M under $80
        draft:
          $ref: "#/components/schemas/IntentDraft"
        ready:
          $ref: "#/components/schemas/ReadyCheck"
        agent:
          $ref: "#/components/schemas/AgentRef"
        status:
          $ref: "#/components/schemas/MandateRequestStatus"
        mandateId:
          type:
            - string
            - "null"
          format: uuid
          description: The signed mandate, once there is one.
          examples:
            - null
        expiresAt:
          type: string
          format: date-time
          description: When the request stops accepting a signature.
          examples:
            - 2026-10-21T18:00:00.000Z
      description: A mandate an outside agent asked the shopper to sign.
      examples:
        - id: 7d1f0c2a-3b4e-4f5a-9c6d-8e7f1a2b3c4d
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
          ready:
            ok: true
          agent:
            name: Claude
            verified: false
          status: PENDING
          mandateId: null
          expiresAt: 2026-10-21T18:00:00.000Z
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
    MandateRequestStatus:
      type: string
      enum:
        - PENDING
        - SIGNED
        - EXPIRED
      description: Where a mandate request stands.
      examples:
        - PENDING
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