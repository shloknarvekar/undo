# Check the service (/docs/api/undo/service/getHealth)

`GET /api/health`

Shallow health check. With `deep`, also proves the service can reach PayPal sandbox and the database. Never returns secret values.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/health:
    get:
      tags:
        - Service
      operationId: getHealth
      summary: Check the service
      description: Shallow health check. With `deep`, also proves the service can
        reach PayPal sandbox and the database. Never returns secret values.
      parameters:
        - name: deep
          in: query
          required: false
          description: Present (any value) to also check PayPal and the database.
          schema:
            type: string
            description: Present (any value) to also check PayPal and the database.
            examples:
              - "1"
      responses:
        "200":
          description: Healthy.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Health"
              examples:
                default:
                  value:
                    ok: true
                    service: undo
                    commit: 319894e
                    configured:
                      paypal: true
                      channel3: true
                      database: true
        "503":
          description: A deep check failed.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Health"
              examples:
                default:
                  value:
                    ok: false
                    service: undo
                    commit: a1dd1af
                    configured:
                      paypal: true
                      channel3: true
                      database: true
                    paypal: Client Authentication failed
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Service.GetHealth(
                      new GetHealthRequest { Deep = "1" });
                  // TODO: Handle 'response' of type Health
              }
              catch (ApiException<GetHealthError> ex)
              {
                  if (ex.Error.TryGetHealth(out var error))
                  {
                      // TODO: Handle 'error' of type Health
                  }
              }
        - lang: python
          label: Python
          sources:
            Example: |-
              try:
                  response = client.service.get_health(deep="1")
                  # TODO: Handle 'response' of type Health
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type GetHealthErrorBody
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.service.getHealth({
                  deep: "1",
                });
                // TODO: Handle 'response' of type Health
              } catch (err) {
                // TODO: Handle 'err' of type Service.GetHealthError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    Health:
      type: object
      required:
        - ok
        - service
        - commit
        - configured
      properties:
        ok:
          type: boolean
          description: True when every check that ran passed.
          examples:
            - true
        service:
          type: string
          description: Always undo.
          examples:
            - undo
        commit:
          type: string
          description: Deployed commit, or `local`.
          examples:
            - a1dd1af
        configured:
          $ref: "#/components/schemas/ConfiguredIntegrations"
        paypal:
          type: string
          description: With `deep`, `reachable` or the error.
          examples:
            - reachable
        database:
          type: object
          additionalProperties: true
          description: "With deep: whether a live query worked, how long it took, and the
            shape of the connection URL (never credentials)."
          examples:
            - {}
        usage:
          type: object
          additionalProperties: true
          description: "With deep: free-tier budget used so far today and this month."
          examples:
            - {}
      description: Service health. Never includes secret values.
      examples:
        - ok: true
          service: undo
          commit: a1dd1af
          configured:
            paypal: true
            channel3: true
            database: true
    ConfiguredIntegrations:
      type: object
      required:
        - paypal
        - channel3
        - database
      properties:
        paypal:
          type: boolean
          description: PayPal sandbox client id and secret are set.
          examples:
            - true
        channel3:
          type: boolean
          description: The product catalog key is set.
          examples:
            - true
        database:
          type: boolean
          description: The Postgres connection string is set.
          examples:
            - true
      description: Which integrations have credentials set. Never the values.
      examples:
        - paypal: true
          channel3: true
          database: true
info:
  title: Undo API
  version: 1.0.0
```