# Update the store's agent rules (/docs/api/undo/merchant/updateMerchantRules)

`PUT /api/merchant/rules`

Applies from the next checkout, for Undo's agent and every MCP agent. Each change is recorded in the store's event chain.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/merchant/rules:
    put:
      tags:
        - Merchant
      operationId: updateMerchantRules
      summary: Update the store's agent rules
      description: Applies from the next checkout, for Undo's agent and every MCP
        agent. Each change is recorded in the store's event chain.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/MerchantRules"
            examples:
              default:
                value:
                  blockBelow: null
                  extendBelow: 50
                  extendMinutes: 360
                  blockUnverified: false
        description: The rules to apply from the next checkout.
      responses:
        "200":
          description: The rules now in force.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MerchantRules"
              examples:
                default:
                  value:
                    blockBelow: null
                    extendBelow: 50
                    extendMinutes: 360
                    blockUnverified: false
        "400":
          $ref: "#/components/responses/InvalidRequest"
        "429":
          $ref: "#/components/responses/RateLimited"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Merchant.UpdateMerchantRules(
                      new UpdateMerchantRulesRequest
                      {
                          Body = new MerchantRules
                          {
                              BlockBelow = 1,
                              ExtendBelow = 50,
                              ExtendMinutes = 360,
                              BlockUnverified = false,
                          },
                      });
                  // TODO: Handle 'response' of type MerchantRules
              }
              catch (ApiException<UpdateMerchantRulesError> ex)
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
                  response = client.merchant.update_merchant_rules(
                      MerchantRules(
                          block_below=1,
                          extend_below=50,
                          extend_minutes=360,
                          block_unverified=False,
                      ),
                  )
                  # TODO: Handle 'response' of type MerchantRules
              except ApiError as e:
                  # TODO: Handle 'e.error' of type
                  # UpdateMerchantRulesErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response =
                  await client.merchant.updateMerchantRules({
                    body: {
                      blockBelow: 1,
                      extendBelow: 50,
                      extendMinutes: 360,
                      blockUnverified: false,
                    },
                  });
                // TODO: Handle 'response' of type MerchantRules
              } catch (err) {
                // TODO: Handle 'err' of type Merchant.UpdateMerchantRulesError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    MerchantRules:
      type: object
      required:
        - blockBelow
        - extendBelow
        - extendMinutes
        - blockUnverified
      properties:
        blockBelow:
          type:
            - integer
            - "null"
          minimum: 1
          maximum: 100
          description: Refuse agents scoring below this. Null turns it off.
          examples:
            - null
        extendBelow:
          type:
            - integer
            - "null"
          minimum: 1
          maximum: 100
          description: Give agents scoring below this a longer window. Null turns it off.
          examples:
            - 50
        extendMinutes:
          type: integer
          minimum: 15
          maximum: 1440
          description: How much longer.
          examples:
            - 360
        blockUnverified:
          type: boolean
          description: Refuse agents without a registered operator key.
          examples:
            - false
      description: The store's rules for agents. They apply from the next checkout.
      examples:
        - blockBelow: null
          extendBelow: 50
          extendMinutes: 360
          blockUnverified: false
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
info:
  title: Undo API
  version: 1.0.0
```