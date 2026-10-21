# Undo a purchase (/docs/api/undo/orders/undoOrder)

`POST /api/orders/{orderId}/undo`

The Undo button. Must be signed by the mandate's shopper key over
`undo-request-v1:<orderId>:<sha256 hex of reason>:<sha256 hex of photo bytes, or ->:<requestedAt>`.
`requestedAt` must be within 15 minutes of now. Runs the fault check, then routes the money: a void inside
the window, or a refund, merchant claim, return or human review after capture. Rate limited per visitor.


```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/orders/{orderId}/undo:
    post:
      tags:
        - Orders
      operationId: undoOrder
      summary: Undo a purchase
      description: >
        The Undo button. Must be signed by the mandate's shopper key over

        `undo-request-v1:<orderId>:<sha256 hex of reason>:<sha256 hex of photo
        bytes, or ->:<requestedAt>`.

        `requestedAt` must be within 15 minutes of now. Runs the fault check,
        then routes the money: a void inside

        the window, or a refund, merchant claim, return or human review after
        capture. Rate limited per visitor.
      parameters:
        - $ref: "#/components/parameters/OrderId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UndoRequest"
            examples:
              default:
                value:
                  reason: This isn't what I asked for.
                  requestedAt: 2026-10-20T16:30:00.000Z
                  signature: derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
        description: Why the shopper is undoing, an optional photo, and their signature.
      responses:
        "200":
          description: The verdict and what happened to the money.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UndoResult"
              examples:
                default:
                  value:
                    orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
                    decision:
                      verdict: AGENT_FAULT
                      evidence:
                        - source: shopper
                          finding: This isn't what I asked for.
                        - source: mandate_check
                          finding: "attribute:size: mandate required 10, agent bought 10.5"
                      liability: agent_operator
                      confidence: 1
                    outcome:
                      action:
                        type: REFUND_FULL
                        reason: "agent broke the mandate: full refund, liability on the agent operator"
                      status: REFUNDED
                      paypal: {}
        "400":
          $ref: "#/components/responses/InvalidRequest"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"
        "413":
          description: The photo is over 4 MB.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
              examples:
                default:
                  value:
                    error: photo_too_large
                    maxBytes: 4194304
        "422":
          $ref: "#/components/responses/Unprocessable"
        "429":
          $ref: "#/components/responses/RateLimited"
        "502":
          $ref: "#/components/responses/UpstreamError"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: >-
              try

              {
                  var response = await client.Orders.UndoOrder(
                      new UndoOrderRequest
                      {
                          OrderId = Guid.Parse(
                              "edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
                          Body = new UndoRequest
                          {
                              Reason = "This isn't what I asked for.",
                              RequestedAt = DateTimeOffset.Parse(
                                  "2026-10-20T16:30:00Z"),
                              Signature = "derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
                          },
                      });
                  // TODO: Handle 'response' of type UndoResult
              }

              catch (ApiException<UndoOrderError> ex)

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
                  response = client.orders.undo_order(
                      UUID("edd288bc-42d0-41d3-9b87-14915f3ff2c6"),
                      UndoRequest(
                          reason="This isn't what I asked for.",
                          requested_at=datetime(
                              2026, 10, 20, 16, 30, 0, tzinfo=timezone.utc
                          ),
                          signature="derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
                      ),
                  )
                  # TODO: Handle 'response' of type UndoResult
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type UndoOrderErrorBody
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.orders.undoOrder({
                  orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
                  body: {
                    reason: "This isn't what I asked for.",
                    requestedAt: new Date(
                      Date.UTC(2026, 9, 20, 16, 30, 0),
                    ),
                    signature:
                      "derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==",
                  },
                });
                // TODO: Handle 'response' of type UndoResult
              } catch (err) {
                // TODO: Handle 'err' of type Orders.UndoOrderError, discriminated with 'err.payload.kind'
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
    UndoRequest:
      type: object
      required:
        - reason
        - requestedAt
        - signature
      properties:
        reason:
          type: string
          minLength: 3
          maxLength: 500
          description: What went wrong, in the shopper's words.
          examples:
            - This isn't what I asked for.
        photo:
          type: string
          description: Optional photo of what arrived, as a base64 JPEG, PNG or WebP data
            URL (max 4 MB).
          pattern: ^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$
          examples:
            - data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=
        requestedAt:
          type: string
          format: date-time
          description: When the shopper pressed Undo. Must be within 15 minutes of the
            server's clock.
          examples:
            - 2026-10-20T16:30:00.000Z
        signature:
          type: string
          minLength: 80
          maxLength: 100
          description: Base64 Ed25519 signature of the undo signing message.
          examples:
            - derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
      description: An Undo, signed by the shopper's device key.
      examples:
        - reason: This isn't what I asked for.
          requestedAt: 2026-10-20T16:30:00.000Z
          signature: derQBgmEoL8kvl3vfHVsmqTVAkGTSvb2ShqDoVFKdSC5U5PpGkYAUsDzgSd80QyEpGEPh4966mrEQ9CzBw0IDA==
    UndoResult:
      type: object
      required:
        - orderId
        - decision
        - outcome
      properties:
        orderId:
          type: string
          format: uuid
          description: The order that was undone.
          examples:
            - edd288bc-42d0-41d3-9b87-14915f3ff2c6
        decision:
          $ref: "#/components/schemas/Decision"
        outcome:
          $ref: "#/components/schemas/UndoOutcome"
      description: The verdict and what happened to the money.
      examples:
        - orderId: edd288bc-42d0-41d3-9b87-14915f3ff2c6
          decision:
            verdict: AGENT_FAULT
            evidence:
              - source: shopper
                finding: This isn't what I asked for.
              - source: mandate_check
                finding: "attribute:size: mandate required 10, agent bought 10.5"
            liability: agent_operator
            confidence: 1
          outcome:
            action:
              type: REFUND_FULL
              reason: "agent broke the mandate: full refund, liability on the agent operator"
            status: REFUNDED
            paypal: {}
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
    Decision:
      type: object
      required:
        - verdict
        - confidence
        - liability
        - evidence
      properties:
        verdict:
          $ref: "#/components/schemas/Verdict"
        confidence:
          type: number
          minimum: 0
          maximum: 1
          description: How sure the fault check is, from 0 to 1. Below 0.7 goes to a person.
          examples:
            - 1
        liability:
          $ref: "#/components/schemas/Liability"
        evidence:
          type: array
          items:
            $ref: "#/components/schemas/EvidenceItem"
          description: Each finding behind the verdict and where it came from.
          examples:
            - - source: shopper
                finding: This isn't what I asked for.
              - source: mandate_check
                finding: "attribute:size: mandate required 10, agent bought 10.5"
      description: The fault check's verdict, who pays, and the evidence behind it.
      examples:
        - verdict: AGENT_FAULT
          evidence:
            - source: shopper
              finding: This isn't what I asked for.
            - source: mandate_check
              finding: "attribute:size: mandate required 10, agent bought 10.5"
          liability: agent_operator
          confidence: 1
    UndoOutcome:
      type: object
      required:
        - action
        - status
        - paypal
      properties:
        action:
          $ref: "#/components/schemas/MoneyAction"
        status:
          $ref: "#/components/schemas/OrderStatus"
        paypal:
          type: object
          description: The PayPal ids behind the money movement.
          additionalProperties:
            type:
              - string
              - "null"
            description: The value for one key in paypal.
            examples:
              - reachable
          examples:
            - key: reachable
        evidenceDigest:
          type: string
          description: SHA-256 of the evidence pack sent with a merchant claim.
          examples:
            - 9d2f1c0b7a4e5f6d8c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d5
      description: What happened to the money and the order's new status.
      examples:
        - action:
            type: REFUND_FULL
            reason: "agent broke the mandate: full refund, liability on the agent operator"
          status: AUTHORIZED
          paypal:
            key: reachable
          evidenceDigest: 9d2f1c0b7a4e5f6d8c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d5
    MoneyAction:
      type: object
      required:
        - type
        - reason
      properties:
        type:
          $ref: "#/components/schemas/MoneyActionType"
        reason:
          type: string
          description: Why, in plain words.
          examples:
            - "agent broke the mandate: full refund, liability on the agent
              operator"
        refundOnReturn:
          type: string
          description: On AUTHORIZE_RETURN, the amount refunded when the item comes back.
          examples:
            - "99.42"
        restockingFee:
          type: string
          description: On AUTHORIZE_RETURN.
          examples:
            - "17.55"
      description: What happens to the money after the verdict.
      examples:
        - type: REFUND_FULL
          reason: "agent broke the mandate: full refund, liability on the agent operator"
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
    MoneyActionType:
      type: string
      enum:
        - VOID
        - REFUND_FULL
        - OPEN_CLAIM
        - AUTHORIZE_RETURN
        - REVIEW
        - NONE
      description: What happens to the money.
      examples:
        - VOID
    Verdict:
      type: string
      enum:
        - AGENT_FAULT
        - MERCHANT_FAULT
        - SHOPPER_CHANGED_MIND
        - INCONCLUSIVE
      description: Who was at fault.
      examples:
        - AGENT_FAULT
    Liability:
      type:
        - string
        - "null"
      enum:
        - agent_operator
        - merchant
        - shopper
      description: Who pays. Null when a person still has to decide.
      examples:
        - agent_operator
    EvidenceItem:
      type: object
      required:
        - source
        - finding
      properties:
        source:
          $ref: "#/components/schemas/EvidenceSource"
        finding:
          type: string
          description: The finding, in plain words.
          examples:
            - "attribute:size: mandate required 10, agent bought 10.5"
      description: One finding behind a verdict and where it came from.
      examples:
        - source: mandate_check
          finding: "attribute:size: mandate required 10, agent bought 10.5"
    EvidenceSource:
      type: string
      enum:
        - mandate_check
        - agent_record
        - delivered_photo
        - ai_judgement
        - shopper
      description: Where a finding came from.
      examples:
        - mandate_check
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