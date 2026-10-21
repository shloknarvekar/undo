# Stream the store's activity (/docs/api/undo/merchant/listMerchantActivity)

`GET /api/merchant/activity`

Every step Undo records, newest first (up to 60). Pass `after` to get only events newer than that id.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/merchant/activity:
    get:
      tags:
        - Merchant
      operationId: listMerchantActivity
      summary: Stream the store's activity
      description: Every step Undo records, newest first (up to 60). Pass `after` to
        get only events newer than that id.
      parameters:
        - name: after
          in: query
          required: false
          description: Only events with an id greater than this.
          schema:
            type: integer
            minimum: 0
            description: Only events with an id greater than this.
            examples:
              - 1200
      responses:
        "200":
          description: Activity events.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ActivityFeed"
              examples:
                default:
                  value:
                    events:
                      - id: 226
                        at: 2026-10-20T12:38:24.861Z
                        type: MERCHANT_RULES_CHANGED
                        kind: record
                        how: Recorded in the chain.
                        orderId: null
                        amount: null
                        agent: null
                        ref: null
                      - id: 225
                        at: 2026-10-20T12:17:27.554Z
                        type: PAYMENT_VOIDED
                        kind: paypal
                        how: "Authorization voided: no money moved and no fees."
                        orderId: 0b1b3bb1-f411-406a-87b7-0bf32f55ed61
                        amount: null
                        agent: null
                        ref: 8L594057D91511610
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Merchant.ListMerchantActivity(
                      new ListMerchantActivityRequest { After = 1200 });
                  // TODO: Handle 'response' of type ActivityFeed
              }
              catch (ApiException<RawError> ex)
              {
                  // TODO: Handle 'ex.Error' of type RawError
              }
        - lang: python
          label: Python
          sources:
            Example: |-
              try:
                  response = client.merchant.list_merchant_activity(
                      after=1200
                  )
                  # TODO: Handle 'response' of type ActivityFeed
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type RawError
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response =
                  await client.merchant.listMerchantActivity({
                    after: 1200,
                  });
                // TODO: Handle 'response' of type ActivityFeed
              } catch (err) {
                // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
              }
components:
  schemas:
    ActivityFeed:
      type: object
      required:
        - events
      properties:
        events:
          type: array
          items:
            $ref: "#/components/schemas/ActivityEvent"
          description: Events, newest first.
          examples:
            - - id: 226
                at: 2026-10-20T12:38:24.861Z
                type: MERCHANT_RULES_CHANGED
                kind: record
                how: Recorded in the chain.
                orderId: null
                amount: null
                agent: null
                ref: null
      description: The store's latest activity.
      examples:
        - events:
            - id: 226
              at: 2026-10-20T12:38:24.861Z
              type: MERCHANT_RULES_CHANGED
              kind: record
              how: Recorded in the chain.
              orderId: null
              amount: null
              agent: null
              ref: null
    ActivityEvent:
      type: object
      required:
        - id
        - at
        - type
        - kind
        - how
      properties:
        id:
          type: integer
          description: Event id. Pass the newest one as after to get only newer events.
          examples:
            - 226
        at:
          type: string
          format: date-time
          description: When it happened.
          examples:
            - 2026-10-20T12:38:24.861Z
        type:
          type: string
          description: Event type, for example PAYMENT_VOIDED.
          examples:
            - PAYMENT_VOIDED
        kind:
          type: string
          description: "Who or what decided this step: shopper, agent, rules, AI or PayPal."
          examples:
            - record
        how:
          type: string
          description: How the step was decided, in plain words.
          examples:
            - Recorded in the chain.
        orderId:
          type:
            - string
            - "null"
          description: The order it belongs to, when there is one.
          examples:
            - null
        amount:
          type:
            - number
            - "null"
          description: Money involved, when there is any.
          examples:
            - null
        agent:
          type:
            - string
            - "null"
          description: The agent operator involved, when there is one.
          examples:
            - null
        ref:
          type:
            - string
            - "null"
          description: The PayPal id or call behind the step, when there is one.
          examples:
            - null
      description: One recorded step in the store's activity.
      examples:
        - id: 226
          at: 2026-10-20T12:38:24.861Z
          type: MERCHANT_RULES_CHANGED
          kind: record
          how: Recorded in the chain.
          orderId: null
          amount: null
          agent: null
          ref: null
info:
  title: Undo API
  version: 1.0.0
```