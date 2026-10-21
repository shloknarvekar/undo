# Search products (/docs/api/undo/products/searchProducts)

`POST /api/products/search`

Searches the live catalog with structured filters. Rate limited per visitor.

```yaml
openapi: 3.2.0
servers:
  - url: https://undo-1c56.onrender.com
    description: Live sandbox deployment
security: []
paths:
  /api/products/search:
    post:
      tags:
        - Products
      operationId: searchProducts
      summary: Search products
      description: Searches the live catalog with structured filters. Rate limited per
        visitor.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ProductSearch"
            examples:
              default:
                value:
                  query: black hoodie
                  maxPrice: 80
                  color: black
                  limit: 5
        description: What to search for and how to filter it.
      responses:
        "200":
          description: Matching products with an offer.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProductSearchResult"
              examples:
                default:
                  value:
                    category: hoodies
                    products:
                      - channel3Id: w25336I
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
        "400":
          $ref: "#/components/responses/InvalidRequest"
        "429":
          $ref: "#/components/responses/RateLimited"
        "502":
          $ref: "#/components/responses/UpstreamError"
      x-apimatic-codeSamples:
        - lang: csharp
          label: C#
          sources:
            Example: |-
              try
              {
                  var response = await client.Products.SearchProducts(
                      new SearchProductsRequest
                      {
                          Body = new ProductSearch
                          {
                              Query = "black hoodie",
                              MaxPrice = 80d,
                              Color = "black",
                              Limit = 5,
                          },
                      });
                  // TODO: Handle 'response' of type ProductSearchResult
              }
              catch (ApiException<SearchProductsError> ex)
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
                  response = client.products.search_products(
                      ProductSearch(
                          query="black hoodie",
                          max_price=80,
                          color="black",
                          limit=5,
                      ),
                  )
                  # TODO: Handle 'response' of type ProductSearchResult
              except ApiError as e:
                  # TODO: Handle 'e.error' of type SearchProductsErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.products.searchProducts({
                  body: {
                    query: "black hoodie",
                    maxPrice: 80,
                    color: "black",
                    limit: 5,
                  },
                });
                // TODO: Handle 'response' of type ProductSearchResult
              } catch (err) {
                // TODO: Handle 'err' of type Products.SearchProductsError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    ProductSearch:
      type: object
      required:
        - query
      properties:
        query:
          type: string
          minLength: 1
          maxLength: 500
          description: What to search for, in plain words.
          examples:
            - black hoodie
        maxPrice:
          type: number
          minimum: 0.01
          description: Highest price per item.
          examples:
            - 80
        minPrice:
          type: number
          minimum: 0
          description: Lowest price per item.
          examples:
            - 20
        color:
          type: string
          maxLength: 30
          description: Color name, for example black.
          examples:
            - black
        category:
          type: string
          maxLength: 60
          description: Plain-words category, resolved server-side.
          examples:
            - hoodie
        gender:
          $ref: "#/components/schemas/Gender"
        limit:
          type: integer
          minimum: 1
          maximum: 30
          description: How many products to return.
          examples:
            - 5
        mode:
          $ref: "#/components/schemas/SearchMode"
      description: A catalog search with structured filters.
      examples:
        - query: black hoodie
          maxPrice: 80
          color: black
          limit: 5
    ProductSearchResult:
      type: object
      required:
        - products
      properties:
        category:
          type:
            - string
            - "null"
          description: The catalog category the search was narrowed to.
          examples:
            - hoodies
        products:
          type: array
          items:
            $ref: "#/components/schemas/Product"
          description: Products that have at least one offer.
          examples:
            - - channel3Id: w25336I
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
      description: Search results.
      examples:
        - category: hoodies
          products:
            - channel3Id: w25336I
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
    Gender:
      type: string
      enum:
        - male
        - female
      description: Men's or women's products.
      examples:
        - male
    SearchMode:
      type: string
      enum:
        - default
        - agentic
      description: How the catalog reads the query.
      examples:
        - default
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