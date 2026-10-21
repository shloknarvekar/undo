# Get a product at a variant (/docs/api/undo/products/getProduct)

`GET /api/products/{productId}`

Fresh product detail resolved to the requested variant. Pass options as `option_<Name>=<value>` query
parameters, for example `option_Size=M&option_Color=Black`. `relaxed` lists any option the catalog could not honor.


```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/products/{productId}:
    get:
      tags:
        - Products
      operationId: getProduct
      summary: Get a product at a variant
      description: >
        Fresh product detail resolved to the requested variant. Pass options as
        `option_<Name>=<value>` query

        parameters, for example `option_Size=M&option_Color=Black`. `relaxed`
        lists any option the catalog could not honor.
      parameters:
        - name: productId
          in: path
          required: true
          description: Catalog product id (`channel3Id` from a search).
          schema:
            type: string
            description: Catalog product id (`channel3Id` from a search).
            examples:
              - w25336I
        - name: options
          in: query
          required: false
          description: Variant options as `option_<Name>` keys.
          style: form
          explode: true
          schema:
            type: object
            additionalProperties:
              type: string
              description: The value for that option.
              examples:
                - "10.5"
            description: Variant options as `option_<Name>` keys.
            examples:
              - option_Size: "10.5"
                option_Color: Black
      responses:
        "200":
          description: The product at the closest available variant.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProductDetail"
              examples:
                default:
                  value:
                    product:
                      channel3Id: w25336I
                      title: UA Infinite Pro Men's Running Shoes
                      brand: Under Armour
                      description: These men's running shoes from Under Armour, the UA Infinite Pro,
                        are designed for endurance with a focus on comfort and
                        support. They feature a breathable e…
                      price: 116.97
                      currency: USD
                      imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5D44F1Y9VDE34RVPPTF1H15&mid=oKaH
                      sourceUrl: https://buy.trychannel3.com/w25336I-oKaH-Wqce8l?o=01KVATPXMQW09XVTMRDEW2Q1Y9&aid=01M5D44F1Y9VDE34RVPPTF1H15
                      sourceDomain: underarmour.com
                      colors:
                        - "#1e1e20"
                        - "#d5d4d8"
                      attributes:
                        activity:
                          - Running
                        pattern:
                          - Texture
                          - Geometric
                        closure-type:
                          - Straps
                          - Lace-up
                        heel-height-type:
                          - Flat
                          - Low
                        footwear-material:
                          - Mesh
                          - Polyester
                        shoe-fit:
                          - Regular
                        shoe-features:
                          - Breathable design
                          - Cushioned
                        toe-style:
                          - Round
                        outsole-material:
                          - Rubber
                        footwear-support-type:
                          - Neutral
                          - Stability
                        lining-material:
                          - Synthetic
                      variant:
                        Size: "10.5"
                      variantOptions:
                        - name: Color
                          values:
                            - Black
                            - White
                        - name: Size
                          values:
                            - "7"
                            - "8"
                    relaxed: []
        "404":
          $ref: "#/components/responses/NotFound"
        "502":
          $ref: "#/components/responses/UpstreamError"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Products.GetProduct(
                      new GetProductRequest
                      {
                          ProductId = "w25336I",
                          Options = new Dictionary<string, string>
                          {
                              ["option_Size"] = "10.5",
                              ["option_Color"] = "Black",
                          },
                      });
                  // TODO: Handle 'response' of type ProductDetail
              }
              catch (ApiException<GetProductError> ex)
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
                  response = client.products.get_product(
                      "w25336I",
                      options={
                          "option_Size": "10.5", "option_Color": "Black"
                      },
                  )
                  # TODO: Handle 'response' of type ProductDetail
              except ApiError as e:
                  # TODO: Handle 'e.error' of type GetProductErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.products.getProduct({
                  productId: "w25336I",
                  options: { option_Size: "10.5", option_Color: "Black" },
                });
                // TODO: Handle 'response' of type ProductDetail
              } catch (err) {
                // TODO: Handle 'err' of type Products.GetProductError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    ProductDetail:
      type: object
      required:
        - product
        - relaxed
      properties:
        product:
          $ref: "#/components/schemas/Product"
        relaxed:
          type: array
          description: Requested options the catalog could not honor.
          items:
            type: object
            additionalProperties: true
            description: One entry in relaxed.
            examples:
              - {}
          examples:
            - []
      description: A product at the requested variant, plus any option the catalog
        couldn't honor.
      examples:
        - product:
            channel3Id: w25336I
            title: UA Infinite Pro Men's Running Shoes
            brand: Under Armour
            description: These men's running shoes from Under Armour, the UA Infinite Pro,
              are designed for endurance with a focus on comfort and support.
              They feature a breathable e…
            price: 116.97
            currency: USD
            imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5D44F1Y9VDE34RVPPTF1H15&mid=oKaH
            sourceUrl: https://buy.trychannel3.com/w25336I-oKaH-Wqce8l?o=01KVATPXMQW09XVTMRDEW2Q1Y9&aid=01M5D44F1Y9VDE34RVPPTF1H15
            sourceDomain: underarmour.com
            colors:
              - "#1e1e20"
              - "#d5d4d8"
            attributes:
              activity:
                - Running
              pattern:
                - Texture
                - Geometric
              closure-type:
                - Straps
                - Lace-up
              heel-height-type:
                - Flat
                - Low
              footwear-material:
                - Mesh
                - Polyester
              shoe-fit:
                - Regular
              shoe-features:
                - Breathable design
                - Cushioned
              toe-style:
                - Round
              outsole-material:
                - Rubber
              footwear-support-type:
                - Neutral
                - Stability
              lining-material:
                - Synthetic
            variant:
              Size: "10.5"
            variantOptions:
              - name: Color
                values:
                  - Black
                  - White
              - name: Size
                values:
                  - "7"
                  - "8"
          relaxed: []
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
    Product:
      type: object
      required:
        - channel3Id
        - title
        - price
        - currency
        - sourceUrl
        - sourceDomain
        - colors
        - attributes
        - variant
        - variantOptions
      properties:
        channel3Id:
          type: string
          description: Catalog product id. Use it with getProduct.
          examples:
            - w25336I
        title:
          type: string
          description: Product title.
          examples:
            - UA Infinite Pro Men's Running Shoes
        brand:
          type:
            - string
            - "null"
          description: Brand name, when known.
          examples:
            - Under Armour
        description:
          type:
            - string
            - "null"
          description: Product description from the retailer, when there is one.
          examples:
            - These men's running shoes from Under Armour, the UA Infinite Pro,
              are designed for endurance with a focus on comfort and support.
              They feature a breathable e…
        price:
          type: number
          description: Price of the chosen offer, per item.
          examples:
            - 116.97
        currency:
          type: string
          description: ISO 4217 currency code.
          examples:
            - USD
        imageUrl:
          type:
            - string
            - "null"
          description: Product image URL, when there is one.
          examples:
            - https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5D44F1Y9VDE34RVPPTF1H15&mid=oKaH
        sourceUrl:
          type: string
          description: Where the product is sold.
          examples:
            - https://buy.trychannel3.com/w25336I-oKaH-Wqce8l?o=01KVATPXMQW09XVTMRDEW2Q1Y9&aid=01M5D44F1Y9VDE34RVPPTF1H15
        sourceDomain:
          type: string
          description: The retailer's domain.
          examples:
            - underarmour.com
        colors:
          type: array
          items:
            type: string
            description: One entry in colors.
            examples:
              - "#1e1e20"
          description: Colors of the product as hex codes.
          examples:
            - - "#1e1e20"
              - "#d5d4d8"
        attributes:
          type: object
          additionalProperties: true
          description: "Catalog attributes. Each value is a list of strings, for example
            activity: [Running]."
          examples:
            - activity:
                - Running
              pattern:
                - Texture
                - Geometric
              closure-type:
                - Straps
                - Lace-up
              heel-height-type:
                - Flat
                - Low
              footwear-material:
                - Mesh
                - Polyester
              shoe-fit:
                - Regular
              shoe-features:
                - Breathable design
                - Cushioned
              toe-style:
                - Round
              outsole-material:
                - Rubber
              footwear-support-type:
                - Neutral
                - Stability
              lining-material:
                - Synthetic
        variant:
          type: object
          description: The exact variant this offer resolves to, for example Size M and
            Color Black.
          additionalProperties:
            type: string
            description: The value for one key in variant.
            examples:
              - "10.5"
          examples:
            - Size: "10.5"
        variantOptions:
          type: array
          items:
            $ref: "#/components/schemas/VariantOption"
          description: Every option the product comes in, with its values.
          examples:
            - - name: Color
                values:
                  - Black
                  - White
              - name: Size
                values:
                  - "7"
                  - "8"
      description: A catalog product resolved to one offer and one exact variant.
      examples:
        - channel3Id: w25336I
          title: UA Infinite Pro Men's Running Shoes
          brand: Under Armour
          description: These men's running shoes from Under Armour, the UA Infinite Pro,
            are designed for endurance with a focus on comfort and support. They
            feature a breathable e…
          price: 116.97
          currency: USD
          imageUrl: https://cdn.trychannel3.com/aed9ec20-0e99-49b6-b011-2425732889be?aid=01M5D44F1Y9VDE34RVPPTF1H15&mid=oKaH
          sourceUrl: https://buy.trychannel3.com/w25336I-oKaH-Wqce8l?o=01KVATPXMQW09XVTMRDEW2Q1Y9&aid=01M5D44F1Y9VDE34RVPPTF1H15
          sourceDomain: underarmour.com
          colors:
            - "#1e1e20"
            - "#d5d4d8"
          attributes:
            activity:
              - Running
            pattern:
              - Texture
              - Geometric
            closure-type:
              - Straps
              - Lace-up
            heel-height-type:
              - Flat
              - Low
            footwear-material:
              - Mesh
              - Polyester
            shoe-fit:
              - Regular
            shoe-features:
              - Breathable design
              - Cushioned
            toe-style:
              - Round
            outsole-material:
              - Rubber
            footwear-support-type:
              - Neutral
              - Stability
            lining-material:
              - Synthetic
          variant:
            Size: "10.5"
          variantOptions:
            - name: Color
              values:
                - Black
                - White
            - name: Size
              values:
                - "7"
                - "8"
    VariantOption:
      type: object
      required:
        - name
        - values
      properties:
        name:
          type: string
          description: Option name, for example Size.
          examples:
            - Size
        values:
          type: array
          items:
            type: string
            description: One entry in values.
            examples:
              - "10.5"
          description: Available values, for example S, M, L.
          examples:
            - - "10.5"
      description: One option a product comes in, with its values.
      examples:
        - name: Size
          values:
            - "10.5"
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