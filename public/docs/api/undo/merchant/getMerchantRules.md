# Get the store's agent rules (/docs/api/undo/merchant/getMerchantRules)

`GET /api/merchant/rules`

The rules the store applies to agents at checkout: block below a trust score, lengthen the undo window below a score, or accept only registered operators.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/merchant/rules:
    get:
      tags:
        - Merchant
      operationId: getMerchantRules
      summary: Get the store's agent rules
      responses:
        "200":
          description: The rules.
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
      description: "The rules the store applies to agents at checkout: block below a
        trust score, lengthen the undo window below a score, or accept only
        registered operators."
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Merchant.GetMerchantRules();
                  // TODO: Handle 'response' of type MerchantRules
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
                  response = client.merchant.get_merchant_rules()
                  # TODO: Handle 'response' of type MerchantRules
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type RawError
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.merchant.getMerchantRules();
                // TODO: Handle 'response' of type MerchantRules
              } catch (err) {
                // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
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
info:
  title: Undo API
  version: 1.0.0
```