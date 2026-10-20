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
from ..errors.shop_mandate_error import ShopMandateErrorBody, shop_mandate_error_mapper
from ..models.shop_mandate_request import ShopMandateRequest, ShopMandateRequestDict
from ..models.shop_result import ShopResult
from ..server.server import Server


class Shopping:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = ShoppingWithRawResponse(client, server)

    def shop_mandate(
        self,
        mandate_id: UUID,
        *,
        body: ShopMandateRequest | ShopMandateRequestDict | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ShopResult:
        """Undo's agent searches, checks the cart against the signed limits, and opens a PayPal checkout in AUTHORIZE
        mode. Without a saved wallet the shopper approves at ``approveUrl``; with one (and only if the mandate allows
        it) the money is held straight away. One live purchase per mandate. Rate limited per visitor.

        Args:
            mandate_id: Mandate id.
            body: Optional demo settings. Send {} for a normal run.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Checkout opened.

        Raises:
            ApiError: The store's rules refused this agent. Not found. The mandate is not active, or a purchase is
                already open (``orderId`` names it). No product fits the mandate. Too many requests from this visitor,
                or the free-tier budget is spent. PayPal, the catalog or the AI model failed. The AI model is
                unavailable right now. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(self._with_raw_response.shop_mandate(mandate_id, body=body, request_options=request_options))

    @property
    def with_raw_response(self) -> ShoppingWithRawResponse:
        return self._with_raw_response


class AsyncShopping:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncShoppingWithRawResponse(client, server)

    async def shop_mandate(
        self,
        mandate_id: UUID,
        *,
        body: ShopMandateRequest | ShopMandateRequestDict | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ShopResult:
        """Undo's agent searches, checks the cart against the signed limits, and opens a PayPal checkout in AUTHORIZE
        mode. Without a saved wallet the shopper approves at ``approveUrl``; with one (and only if the mandate allows
        it) the money is held straight away. One live purchase per mandate. Rate limited per visitor.

        Args:
            mandate_id: Mandate id.
            body: Optional demo settings. Send {} for a normal run.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Checkout opened.

        Raises:
            ApiError: The store's rules refused this agent. Not found. The mandate is not active, or a purchase is
                already open (``orderId`` names it). No product fits the mandate. Too many requests from this visitor,
                or the free-tier budget is spent. PayPal, the catalog or the AI model failed. The AI model is
                unavailable right now. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(
            await self._with_raw_response.shop_mandate(mandate_id, body=body, request_options=request_options)
        )

    @property
    def with_raw_response(self) -> AsyncShoppingWithRawResponse:
        return self._with_raw_response


class ShoppingWithRawResponse(BaseRawResponse[RawClient, Server]):
    def shop_mandate(
        self,
        mandate_id: UUID,
        *,
        body: ShopMandateRequest | ShopMandateRequestDict | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ShopResult, ShopMandateErrorBody]:
        """Undo's agent searches, checks the cart against the signed limits, and opens a PayPal checkout in AUTHORIZE
        mode. Without a saved wallet the shopper approves at ``approveUrl``; with one (and only if the mandate allows
        it) the money is held straight away. One live purchase per mandate. Rate limited per visitor.

        Args:
            mandate_id: Mandate id.
            body: Optional demo settings. Send {} for a normal run.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandates/{mandateId}/shop"),
            path_params=[param[UUID]("mandateId", mandate_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[ShopMandateRequest | ShopMandateRequestDict | None](body),
            decoder=json_decoder[ShopResult],
            error_mapper=shop_mandate_error_mapper,
            request_options=request_options,
        )


class AsyncShoppingWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def shop_mandate(
        self,
        mandate_id: UUID,
        *,
        body: ShopMandateRequest | ShopMandateRequestDict | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ShopResult, ShopMandateErrorBody]:
        """Undo's agent searches, checks the cart against the signed limits, and opens a PayPal checkout in AUTHORIZE
        mode. Without a saved wallet the shopper approves at ``approveUrl``; with one (and only if the mandate allows
        it) the money is held straight away. One live purchase per mandate. Rate limited per visitor.

        Args:
            mandate_id: Mandate id.
            body: Optional demo settings. Send {} for a normal run.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandates/{mandateId}/shop"),
            path_params=[param[UUID]("mandateId", mandate_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[ShopMandateRequest | ShopMandateRequestDict | None](body),
            decoder=async_json_decoder[ShopResult],
            error_mapper=shop_mandate_error_mapper,
            request_options=request_options,
        )
