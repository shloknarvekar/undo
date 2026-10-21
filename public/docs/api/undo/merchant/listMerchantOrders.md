# List agent orders (/docs/api/undo/merchant/listMerchantOrders)

`GET /api/merchant/orders`

Every agent order (latest 300) with its verdict, who pays and any agent payout, plus headline numbers.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/merchant/orders:
    get:
      tags:
        - Merchant
      operationId: listMerchantOrders
      summary: List agent orders
      description: Every agent order (latest 300) with its verdict, who pays and any
        agent payout, plus headline numbers.
      responses:
        "200":
          description: Orders and KPIs.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MerchantOrders"
              examples:
                default:
                  value:
                    kpis:
                      agentOrders: 22
                      undone: 16
                      feesAvoided: 54.209861000000004
                      billedToAgents: 293.93
                      merchantProtected: 3
                      needsAction: 0
                      heldNow: 0
                    orders:
                      - id: 0b1b3bb1-f411-406a-87b7-0bf32f55ed61
                        createdAt: 2026-10-20T12:14:48.268Z
                        status: VOIDED
                        amount: 59.99
                        currency: USD
                        product: Mens Boxy Hoodie
                        brand: Cernucci
                        variant: Size M
                        imageUrl: https://cdn.trychannel3.com/b9e090b6-615d-4117-a827-c1dad96f2a12?aid=01M5CKRKZAQ4Z7XXEQEKMJVC9V&mid=m7kZ
                        retailer: us.cernucci.com
                        request: A black hoodie, size M, under $80
                        agentConfidence: 0.8
                        guardBypassed: false
                        simulated: null
                        agentName: Undo web agent
                        agentVerified: true
                        agentVia: web
                        verdict: MERCHANT_FAULT
                        verdictConfidence: 1
                        liability: merchant
                        settlement: null
                        settledAmount: 0
                        action: VOID
                        windowEndsAt: 2026-10-20T19:15:15.261Z
                        windowMinutesLeft: null
                        paypalRef: 8L594057D91511610
                      - id: f4e45935-229f-48f8-918a-be44a4997a9f
                        createdAt: 2026-10-20T07:49:05.299Z
                        status: VOIDED
                        amount: 116.97
                        currency: USD
                        product: UA Infinite Pro Men's Running Shoes
                        brand: Under Armour
                        variant: Size 10.5 · Color Black
                        imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5C4J3G46ER2Y26PBPQ3QGZB&mid=oKaH
                        retailer: underarmour.com
                        request: Black men's running shoes, size 10, under $120
                        agentConfidence: 0.9
                        guardBypassed: true
                        simulated: unguarded_wrong_variant
                        agentName: Careless demo agent
                        agentVerified: false
                        agentVia: web
                        verdict: AGENT_FAULT
                        verdictConfidence: 1
                        liability: agent_operator
                        settlement: null
                        settledAmount: 0
                        action: VOID
                        windowEndsAt: 2026-10-21T07:49:23.031Z
                        windowMinutesLeft: null
                        paypalRef: 3LJ53399FX105624A
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Merchant.ListMerchantOrders();
                  // TODO: Handle 'response' of type MerchantOrders
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
                  response = client.merchant.list_merchant_orders()
                  # TODO: Handle 'response' of type MerchantOrders
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type RawError
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response =
                  await client.merchant.listMerchantOrders();
                // TODO: Handle 'response' of type MerchantOrders
              } catch (err) {
                // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
              }
components:
  schemas:
    MerchantOrders:
      type: object
      required:
        - kpis
        - orders
      properties:
        kpis:
          $ref: "#/components/schemas/MerchantKpis"
        orders:
          type: array
          items:
            $ref: "#/components/schemas/MerchantOrder"
          description: Agent orders, newest first.
          examples:
            - - id: 0b1b3bb1-f411-406a-87b7-0bf32f55ed61
                createdAt: 2026-10-20T12:14:48.268Z
                status: VOIDED
                amount: 59.99
                currency: USD
                product: Mens Boxy Hoodie
                brand: Cernucci
                variant: Size M
                imageUrl: https://cdn.trychannel3.com/b9e090b6-615d-4117-a827-c1dad96f2a12?aid=01M5CKRKZAQ4Z7XXEQEKMJVC9V&mid=m7kZ
                retailer: us.cernucci.com
                request: A black hoodie, size M, under $80
                agentConfidence: 0.8
                guardBypassed: false
                simulated: null
                agentName: Undo web agent
                agentVerified: true
                agentVia: web
                verdict: MERCHANT_FAULT
                verdictConfidence: 1
                liability: merchant
                settlement: null
                settledAmount: 0
                action: VOID
                windowEndsAt: 2026-10-20T19:15:15.261Z
                windowMinutesLeft: null
                paypalRef: 8L594057D91511610
              - id: f4e45935-229f-48f8-918a-be44a4997a9f
                createdAt: 2026-10-20T07:49:05.299Z
                status: VOIDED
                amount: 116.97
                currency: USD
                product: UA Infinite Pro Men's Running Shoes
                brand: Under Armour
                variant: Size 10.5 · Color Black
                imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5C4J3G46ER2Y26PBPQ3QGZB&mid=oKaH
                retailer: underarmour.com
                request: Black men's running shoes, size 10, under $120
                agentConfidence: 0.9
                guardBypassed: true
                simulated: unguarded_wrong_variant
                agentName: Careless demo agent
                agentVerified: false
                agentVia: web
                verdict: AGENT_FAULT
                verdictConfidence: 1
                liability: agent_operator
                settlement: null
                settledAmount: 0
                action: VOID
                windowEndsAt: 2026-10-21T07:49:23.031Z
                windowMinutesLeft: null
                paypalRef: 3LJ53399FX105624A
      description: The store's agent orders and headline numbers.
      examples:
        - kpis:
            agentOrders: 22
            undone: 16
            feesAvoided: 54.209861000000004
            billedToAgents: 293.93
            merchantProtected: 3
            needsAction: 0
            heldNow: 0
          orders:
            - id: 0b1b3bb1-f411-406a-87b7-0bf32f55ed61
              createdAt: 2026-10-20T12:14:48.268Z
              status: VOIDED
              amount: 59.99
              currency: USD
              product: Mens Boxy Hoodie
              brand: Cernucci
              variant: Size M
              imageUrl: https://cdn.trychannel3.com/b9e090b6-615d-4117-a827-c1dad96f2a12?aid=01M5CKRKZAQ4Z7XXEQEKMJVC9V&mid=m7kZ
              retailer: us.cernucci.com
              request: A black hoodie, size M, under $80
              agentConfidence: 0.8
              guardBypassed: false
              simulated: null
              agentName: Undo web agent
              agentVerified: true
              agentVia: web
              verdict: MERCHANT_FAULT
              verdictConfidence: 1
              liability: merchant
              settlement: null
              settledAmount: 0
              action: VOID
              windowEndsAt: 2026-10-20T19:15:15.261Z
              windowMinutesLeft: null
              paypalRef: 8L594057D91511610
            - id: f4e45935-229f-48f8-918a-be44a4997a9f
              createdAt: 2026-10-20T07:49:05.299Z
              status: VOIDED
              amount: 116.97
              currency: USD
              product: UA Infinite Pro Men's Running Shoes
              brand: Under Armour
              variant: Size 10.5 · Color Black
              imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5C4J3G46ER2Y26PBPQ3QGZB&mid=oKaH
              retailer: underarmour.com
              request: Black men's running shoes, size 10, under $120
              agentConfidence: 0.9
              guardBypassed: true
              simulated: unguarded_wrong_variant
              agentName: Careless demo agent
              agentVerified: false
              agentVia: web
              verdict: AGENT_FAULT
              verdictConfidence: 1
              liability: agent_operator
              settlement: null
              settledAmount: 0
              action: VOID
              windowEndsAt: 2026-10-21T07:49:23.031Z
              windowMinutesLeft: null
              paypalRef: 3LJ53399FX105624A
    MerchantKpis:
      type: object
      required:
        - agentOrders
        - undone
        - feesAvoided
        - billedToAgents
        - merchantProtected
        - needsAction
        - heldNow
      properties:
        agentOrders:
          type: integer
          description: Orders placed by agents (not counting abandoned checkouts).
          examples:
            - 1
        undone:
          type: integer
          description: Orders that were undone.
          examples:
            - 1
        feesAvoided:
          type: number
          description: Estimated PayPal fees avoided by voiding instead of refunding.
          examples:
            - 1.5
        billedToAgents:
          type: number
          description: Money paid back to the store by agent operators through PayPal
            Payouts.
          examples:
            - 1.5
        merchantProtected:
          type: integer
          description: Undos where the shopper changed their mind and the store was
            protected.
          examples:
            - 1
        needsAction:
          type: integer
          description: Orders waiting for the store's decision.
          examples:
            - 1
        heldNow:
          type: number
          description: Money held right now with an undo window open.
          examples:
            - 1.5
      description: Headline numbers for the store.
      examples:
        - agentOrders: 1
          undone: 1
          feesAvoided: 1.5
          billedToAgents: 1.5
          merchantProtected: 1
          needsAction: 1
          heldNow: 1.5
    MerchantOrder:
      type: object
      required:
        - id
        - createdAt
        - status
        - amount
        - currency
        - product
        - agentName
        - agentVerified
      properties:
        id:
          type: string
          format: uuid
          description: Undo order id.
          examples:
            - 0b1b3bb1-f411-406a-87b7-0bf32f55ed61
        createdAt:
          type: string
          format: date-time
          description: When the agent placed the order.
          examples:
            - 2026-10-20T12:14:48.268Z
        status:
          $ref: "#/components/schemas/OrderStatus"
        amount:
          type: number
          description: Order total.
          examples:
            - 59.99
        currency:
          type: string
          description: ISO 4217 currency code.
          examples:
            - USD
        product:
          type: string
          description: Product title.
          examples:
            - Mens Boxy Hoodie
        brand:
          type:
            - string
            - "null"
          description: Brand name, when known.
          examples:
            - Cernucci
        variant:
          type: string
          description: The variant bought, for example Size M · Color Black.
          examples:
            - Size M
        imageUrl:
          type:
            - string
            - "null"
          description: Product image URL, when there is one.
          examples:
            - https://cdn.trychannel3.com/b9e090b6-615d-4117-a827-c1dad96f2a12?aid=01M5CKRKZAQ4Z7XXEQEKMJVC9V&mid=m7kZ
        retailer:
          type:
            - string
            - "null"
          description: The retailer's domain.
          examples:
            - us.cernucci.com
        request:
          type:
            - string
            - "null"
          description: The shopper's mandate, in their words.
          examples:
            - A black hoodie, size M, under $80
        agentConfidence:
          type:
            - number
            - "null"
          description: How sure the agent was that the item fits, from 0 to 1.
          examples:
            - 0.8
        guardBypassed:
          type: boolean
          description: True when the agent skipped Undo's checks before buying.
          examples:
            - false
        simulated:
          type:
            - string
            - "null"
          description: Set on demo orders from the careless test agent.
          examples:
            - null
        agentName:
          type: string
          description: The agent operator's name.
          examples:
            - Undo web agent
        agentVerified:
          type: boolean
          description: Whether the operator presented a registered key.
          examples:
            - true
        agentVia:
          type: string
          description: "How the agent connected: web or mcp."
          examples:
            - web
        verdict:
          type:
            - string
            - "null"
          description: The fault check's verdict, after an Undo.
          examples:
            - MERCHANT_FAULT
        verdictConfidence:
          type:
            - number
            - "null"
          description: How sure the verdict is, from 0 to 1.
          examples:
            - 1
        liability:
          type:
            - string
            - "null"
          description: "Who pays: agent_operator, merchant or shopper."
          examples:
            - merchant
        settlement:
          type:
            - string
            - "null"
          description: Status of the agent operator's payout to the store, when one was due.
          examples:
            - null
        settledAmount:
          type: number
          description: Money that arrived from an agent operator through PayPal Payouts.
          examples:
            - 0
        action:
          type:
            - string
            - "null"
          description: What happened to the money, for example VOID or REFUND_FULL.
          examples:
            - VOID
        windowEndsAt:
          type:
            - string
            - "null"
          format: date-time
          description: When the undo window closes or closed.
          examples:
            - 2026-10-20T19:15:15.261Z
        windowMinutesLeft:
          type:
            - integer
            - "null"
          description: Minutes left in the undo window, while the money is held.
          examples:
            - null
        paypalRef:
          type:
            - string
            - "null"
          description: "The most specific PayPal id: capture, then authorization, then
            order."
          examples:
            - 8L594057D91511610
      description: One agent order as the store sees it.
      examples:
        - id: 0b1b3bb1-f411-406a-87b7-0bf32f55ed61
          createdAt: 2026-10-20T12:14:48.268Z
          status: VOIDED
          amount: 59.99
          currency: USD
          product: Mens Boxy Hoodie
          brand: Cernucci
          variant: Size M
          imageUrl: https://cdn.trychannel3.com/b9e090b6-615d-4117-a827-c1dad96f2a12?aid=01M5CKRKZAQ4Z7XXEQEKMJVC9V&mid=m7kZ
          retailer: us.cernucci.com
          request: A black hoodie, size M, under $80
          agentConfidence: 0.8
          guardBypassed: false
          simulated: null
          agentName: Undo web agent
          agentVerified: true
          agentVia: web
          verdict: MERCHANT_FAULT
          verdictConfidence: 1
          liability: merchant
          settlement: null
          settledAmount: 0
          action: VOID
          windowEndsAt: 2026-10-20T19:15:15.261Z
          windowMinutesLeft: null
          paypalRef: 8L594057D91511610
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
info:
  title: Undo API
  version: 1.0.0
```