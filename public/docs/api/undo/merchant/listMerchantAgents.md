# List agents and their trust scores (/docs/api/undo/merchant/listMerchantAgents)

`GET /api/merchant/agents`

Every agent that has shopped here, its record and trust score with every point explained, and what the store's rules do to it.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/merchant/agents:
    get:
      tags:
        - Merchant
      operationId: listMerchantAgents
      summary: List agents and their trust scores
      description: Every agent that has shopped here, its record and trust score with
        every point explained, and what the store's rules do to it.
      responses:
        "200":
          description: Agents and the store's rules.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MerchantAgents"
              examples:
                default:
                  value:
                    rules:
                      blockBelow: null
                      extendBelow: 50
                      extendMinutes: 360
                      blockUnverified: false
                    agents:
                      - name: Careless demo agent
                        verified: false
                        via: web
                        purchases: 11
                        faults: 9
                        refused: 0
                        bypassed: 11
                        lastSeen: 2026-10-20T07:49:05.299Z
                        trust:
                          score: 0
                          tier: risky
                          factors:
                            - label: unregistered name
                              points: 50
                            - label: 2 clean purchases
                              points: 6
                        effect:
                          blocked: null
                          extraMinutes: 360
                          reason: "merchant rule: Careless demo agent trust 0, below 50"
                      - name: Spike Agent
                        verified: false
                        via: mcp
                        purchases: 0
                        faults: 0
                        refused: 4
                        bypassed: 0
                        lastSeen: 2026-10-18T07:44:53.243Z
                        trust:
                          score: 30
                          tier: risky
                          factors:
                            - label: unregistered name
                              points: 50
                            - label: 4 carts refused by the guard
                              points: -20
                        effect:
                          blocked: null
                          extraMinutes: 360
                          reason: "merchant rule: Spike Agent trust 30, below 50"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Merchant.ListMerchantAgents();
                  // TODO: Handle 'response' of type MerchantAgents
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
                  response = client.merchant.list_merchant_agents()
                  # TODO: Handle 'response' of type MerchantAgents
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type RawError
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response =
                  await client.merchant.listMerchantAgents();
                // TODO: Handle 'response' of type MerchantAgents
              } catch (err) {
                // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
              }
components:
  schemas:
    MerchantAgents:
      type: object
      required:
        - rules
        - agents
      properties:
        rules:
          $ref: "#/components/schemas/MerchantRules"
        agents:
          type: array
          items:
            $ref: "#/components/schemas/AgentRecord"
          description: Every agent that has shopped here, riskiest first.
          examples:
            - - name: Careless demo agent
                verified: false
                via: web
                purchases: 11
                faults: 9
                refused: 0
                bypassed: 11
                lastSeen: 2026-10-20T07:49:05.299Z
                trust:
                  score: 0
                  tier: risky
                  factors:
                    - label: unregistered name
                      points: 50
                    - label: 2 clean purchases
                      points: 6
                effect:
                  blocked: null
                  extraMinutes: 360
                  reason: "merchant rule: Careless demo agent trust 0, below 50"
              - name: Spike Agent
                verified: false
                via: mcp
                purchases: 0
                faults: 0
                refused: 4
                bypassed: 0
                lastSeen: 2026-10-18T07:44:53.243Z
                trust:
                  score: 30
                  tier: risky
                  factors:
                    - label: unregistered name
                      points: 50
                    - label: 4 carts refused by the guard
                      points: -20
                effect:
                  blocked: null
                  extraMinutes: 360
                  reason: "merchant rule: Spike Agent trust 30, below 50"
      description: Every agent that has shopped here and the store's rules.
      examples:
        - rules:
            blockBelow: null
            extendBelow: 50
            extendMinutes: 360
            blockUnverified: false
          agents:
            - name: Careless demo agent
              verified: false
              via: web
              purchases: 11
              faults: 9
              refused: 0
              bypassed: 11
              lastSeen: 2026-10-20T07:49:05.299Z
              trust:
                score: 0
                tier: risky
                factors:
                  - label: unregistered name
                    points: 50
                  - label: 2 clean purchases
                    points: 6
              effect:
                blocked: null
                extraMinutes: 360
                reason: "merchant rule: Careless demo agent trust 0, below 50"
            - name: Spike Agent
              verified: false
              via: mcp
              purchases: 0
              faults: 0
              refused: 4
              bypassed: 0
              lastSeen: 2026-10-18T07:44:53.243Z
              trust:
                score: 30
                tier: risky
                factors:
                  - label: unregistered name
                    points: 50
                  - label: 4 carts refused by the guard
                    points: -20
              effect:
                blocked: null
                extraMinutes: 360
                reason: "merchant rule: Spike Agent trust 30, below 50"
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
    AgentRecord:
      type: object
      required:
        - name
        - verified
        - trust
        - effect
      properties:
        name:
          type: string
          description: The agent operator's name.
          examples:
            - Careless demo agent
        verified:
          type: boolean
          description: Whether the agent presented a registered operator key.
          examples:
            - true
        via:
          type:
            - string
            - "null"
          description: "How the agent connected: web or mcp."
          examples:
            - web
        purchases:
          type: integer
          description: Purchases made at this store.
          examples:
            - 1
        faults:
          type: integer
          description: Undos where the agent was at fault.
          examples:
            - 1
        trust:
          $ref: "#/components/schemas/Trust"
        effect:
          $ref: "#/components/schemas/RuleEffect"
      additionalProperties: true
      description: An agent's record at this store and what the rules do to it.
      examples:
        - name: Careless demo agent
          verified: true
          via: web
          purchases: 1
          faults: 1
          trust:
            score: 62
            tier: trusted
            factors:
              - label: unregistered name
                points: 50
              - label: 4 clean purchases
                points: 12
          effect:
            blocked: This store only accepts registered agent operators.
            extraMinutes: 1
            reason: "risky agent: undo window +6h"
    Trust:
      type: object
      required:
        - score
        - tier
      properties:
        score:
          type: integer
          minimum: 0
          maximum: 100
          description: 0 to 100, from the agent's record at this store.
          examples:
            - 62
        tier:
          $ref: "#/components/schemas/TrustTier"
        factors:
          type: array
          items:
            $ref: "#/components/schemas/TrustFactor"
          description: Every point in the score, explained.
          examples:
            - - label: unregistered name
                points: 50
              - label: 4 clean purchases
                points: 12
      description: An agent's trust score at this store, with every point explained.
      examples:
        - score: 62
          tier: neutral
          factors:
            - label: unregistered name
              points: 50
            - label: 4 clean purchases
              points: 12
    RuleEffect:
      type: object
      required:
        - blocked
        - extraMinutes
      properties:
        blocked:
          type:
            - string
            - "null"
          description: Why the agent would be refused, or null.
          examples:
            - This store only accepts registered agent operators.
        extraMinutes:
          type: integer
          description: Extra undo-window minutes the rules add.
          examples:
            - 1
        reason:
          type:
            - string
            - "null"
          description: Which rule added the time, or null.
          examples:
            - "risky agent: undo window +6h"
      description: What the store's rules do to this agent's next purchase.
      examples:
        - blocked: This store only accepts registered agent operators.
          extraMinutes: 1
          reason: "risky agent: undo window +6h"
    TrustTier:
      type: string
      enum:
        - trusted
        - neutral
        - risky
      description: An agent's trust band.
      examples:
        - trusted
    TrustFactor:
      type: object
      required:
        - label
        - points
      properties:
        label:
          type: string
          description: What earned or cost points.
          examples:
            - unregistered name
        points:
          type: integer
          description: Points added (negative when taken away).
          examples:
            - 1
      description: One part of an agent's trust score.
      examples:
        - label: unregistered name
          points: 1
info:
  title: Undo API
  version: 1.0.0
```