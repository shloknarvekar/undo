# Resolve an order as the merchant (/docs/api/undo/merchant/resolveOrder)

`POST /api/orders/{orderId}/resolve`

The merchant's side of an Undo. Sandbox only.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/orders/{orderId}/resolve:
    post:
      tags:
        - Merchant
      operationId: resolveOrder
      summary: Resolve an order as the merchant
      description: The merchant's side of an Undo. Sandbox only.
      parameters:
        - $ref: "#/components/parameters/OrderId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ResolveOrderRequest"
            examples:
              default:
                value:
                  action: retry_settlement
        description: The merchant's decision.
      responses:
        "200":
          description: Done; the body describes the PayPal actions taken.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ResolveOrderResult"
              examples:
                default:
                  value:
                    orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
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
        "400":
          $ref: "#/components/responses/InvalidRequest"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"
        "502":
          $ref: "#/components/responses/UpstreamError"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Merchant.ResolveOrder(
                      new ResolveOrderOperationRequest
                      {
                          OrderId = Guid.Parse(
                              "edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
                          Body = new ResolveOrderRequest
                          {
                              Action = ResolveAction.RetrySettlement,
                          },
                      });
                  // TODO: Handle 'response' of type ResolveOrderResult
              }
              catch (ApiException<ResolveOrderError> ex)
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
                  response = client.merchant.resolve_order(
                      UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
                      ResolveOrderRequest(
                          action=ResolveAction.RETRY_SETTLEMENT
                      ),
                  )
                  # TODO: Handle 'response' of type ResolveOrderResult
              except ApiError as e:
                  # TODO: Handle 'e.error' of type ResolveOrderErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.merchant.resolveOrder({
                  orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
                  body: { action: ResolveAction.RetrySettlement },
                });
                // TODO: Handle 'response' of type ResolveOrderResult
              } catch (err) {
                // TODO: Handle 'err' of type Merchant.ResolveOrderError, discriminated with 'err.payload.kind'
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
    ResolveOrderRequest:
      type: object
      required:
        - action
      properties:
        action:
          $ref: "#/components/schemas/ResolveAction"
      description: What the merchant decided.
      examples:
        - action: accept_claim
    ResolveOrderResult:
      type: object
      required:
        - orderId
      properties:
        orderId:
          type: string
          format: uuid
          description: The order that was resolved.
          examples:
            - edd288bc-42d0-41d3-9b87-14915f3ff2c6
      additionalProperties: true
      description: What the merchant's decision did.
      examples:
        - orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
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
    ResolveAction:
      type: string
      enum:
        - accept_claim
        - return_received
        - retry_settlement
      description: What the merchant decides about an order.
      examples:
        - accept_claim
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
info:
  title: Undo API
  version: 1.0.0
```