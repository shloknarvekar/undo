from __future__ import annotations

from uuid import UUID, uuid4

from ..core import (
    ApiResult,
    AsyncRawClient,
    BaseRawResponse,
    RawClient,
    RequestOptionsOrDict,
    async_json_decoder,
    json_body,
    json_decoder,
    param,
    unwrap,
)
from ..errors.get_product_error import GetProductErrorBody, get_product_error_mapper
from ..errors.search_products_error import SearchProductsErrorBody, search_products_error_mapper
from ..models.product_detail import ProductDetail
from ..models.product_search import ProductSearch, ProductSearchDict
from ..models.product_search_result import ProductSearchResult
from ..server.server import Server


class Products:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = ProductsWithRawResponse(client, server)

    def get_product(
        self,
        product_id: str,
        *,
        options: dict[str, str] | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ProductDetail:
        """Fresh product detail resolved to the requested variant. Pass options as ``option_<Name>=<value>`` query
        parameters, for example ``option_Size=M&option_Color=Black``. ``relaxed`` lists any option the catalog could not
        honor.

        Args:
            product_id: Catalog product id (``channel3Id`` from a search).
            options: Variant options as ``option_<Name>`` keys.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The product at the closest available variant.

        Raises:
            ApiError: Not found. PayPal, the catalog or the AI model failed. ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.get_product(product_id, options=options, request_options=request_options))

    def search_products(
        self, body: ProductSearch | ProductSearchDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ProductSearchResult:
        """Searches the live catalog with structured filters. Rate limited per visitor.

        Args:
            body: What to search for and how to filter it.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Matching products with an offer.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Too many requests from this visitor, or
                the free-tier budget is spent. PayPal, the catalog or the AI model failed. ``error`` is ``Error |
                RateLimited | RawError``."""
        return unwrap(self._with_raw_response.search_products(body, request_options=request_options))

    @property
    def with_raw_response(self) -> ProductsWithRawResponse:
        return self._with_raw_response


class AsyncProducts:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncProductsWithRawResponse(client, server)

    async def get_product(
        self,
        product_id: str,
        *,
        options: dict[str, str] | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ProductDetail:
        """Fresh product detail resolved to the requested variant. Pass options as ``option_<Name>=<value>`` query
        parameters, for example ``option_Size=M&option_Color=Black``. ``relaxed`` lists any option the catalog could not
        honor.

        Args:
            product_id: Catalog product id (``channel3Id`` from a search).
            options: Variant options as ``option_<Name>`` keys.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The product at the closest available variant.

        Raises:
            ApiError: Not found. PayPal, the catalog or the AI model failed. ``error`` is ``Error | RawError``."""
        return unwrap(
            await self._with_raw_response.get_product(product_id, options=options, request_options=request_options)
        )

    async def search_products(
        self, body: ProductSearch | ProductSearchDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ProductSearchResult:
        """Searches the live catalog with structured filters. Rate limited per visitor.

        Args:
            body: What to search for and how to filter it.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Matching products with an offer.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Too many requests from this visitor, or
                the free-tier budget is spent. PayPal, the catalog or the AI model failed. ``error`` is ``Error |
                RateLimited | RawError``."""
        return unwrap(await self._with_raw_response.search_products(body, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncProductsWithRawResponse:
        return self._with_raw_response


class ProductsWithRawResponse(BaseRawResponse[RawClient, Server]):
    def get_product(
        self,
        product_id: str,
        *,
        options: dict[str, str] | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ProductDetail, GetProductErrorBody]:
        """Fresh product detail resolved to the requested variant. Pass options as ``option_<Name>=<value>`` query
        parameters, for example ``option_Size=M&option_Color=Black``. ``relaxed`` lists any option the catalog could not
        honor.

        Args:
            product_id: Catalog product id (``channel3Id`` from a search).
            options: Variant options as ``option_<Name>`` keys.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/products/{productId}"),
            path_params=[param[str]("productId", product_id)],
            query_params=[param[dict[str, str] | None]("options", options)],
            decoder=json_decoder[ProductDetail],
            error_mapper=get_product_error_mapper,
            request_options=request_options,
        )

    def search_products(
        self, body: ProductSearch | ProductSearchDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ProductSearchResult, SearchProductsErrorBody]:
        """Searches the live catalog with structured filters. Rate limited per visitor.

        Args:
            body: What to search for and how to filter it.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/products/search"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[ProductSearch | ProductSearchDict](body),
            decoder=json_decoder[ProductSearchResult],
            error_mapper=search_products_error_mapper,
            request_options=request_options,
        )


class AsyncProductsWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def get_product(
        self,
        product_id: str,
        *,
        options: dict[str, str] | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ProductDetail, GetProductErrorBody]:
        """Fresh product detail resolved to the requested variant. Pass options as ``option_<Name>=<value>`` query
        parameters, for example ``option_Size=M&option_Color=Black``. ``relaxed`` lists any option the catalog could not
        honor.

        Args:
            product_id: Catalog product id (``channel3Id`` from a search).
            options: Variant options as ``option_<Name>`` keys.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/products/{productId}"),
            path_params=[param[str]("productId", product_id)],
            query_params=[param[dict[str, str] | None]("options", options)],
            decoder=async_json_decoder[ProductDetail],
            error_mapper=get_product_error_mapper,
            request_options=request_options,
        )

    async def search_products(
        self, body: ProductSearch | ProductSearchDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ProductSearchResult, SearchProductsErrorBody]:
        """Searches the live catalog with structured filters. Rate limited per visitor.

        Args:
            body: What to search for and how to filter it.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/products/search"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[ProductSearch | ProductSearchDict](body),
            decoder=async_json_decoder[ProductSearchResult],
            error_mapper=search_products_error_mapper,
            request_options=request_options,
        )
