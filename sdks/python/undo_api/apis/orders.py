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
from ..errors.get_order_error import GetOrderErrorBody, get_order_error_mapper
from ..errors.get_order_evidence_error import GetOrderEvidenceErrorBody, get_order_evidence_error_mapper
from ..errors.undo_order_error import UndoOrderErrorBody, undo_order_error_mapper
from ..models.evidence import Evidence
from ..models.order_view import OrderView
from ..models.undo_request import UndoRequest, UndoRequestDict
from ..models.undo_result import UndoResult
from ..server.server import Server


class Orders:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = OrdersWithRawResponse(client, server)

    def get_order(self, order_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> OrderView:
        """The purchase, the live undo window, the mandate behind it, and its verified event chain. Each event carries
        its proof.

        Args:
            order_id: Undo order id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The order.

        Raises:
            ApiError: Not found. ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.get_order(order_id, request_options=request_options))

    def get_order_evidence(self, order_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> Evidence:
        """Everything needed to check an order without trusting Undo: the raw hash-chained events exactly as hashed and
        the signed mandate exactly as stored. Nothing is pre-verified, on purpose.

        Args:
            order_id: Undo order id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The evidence file (``undo-evidence-v1``).

        Raises:
            ApiError: Not found. ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.get_order_evidence(order_id, request_options=request_options))

    def undo_order(
        self,
        order_id: UUID,
        body: UndoRequest | UndoRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> UndoResult:
        """The Undo button. Must be signed by the mandate's shopper key over ``undo-request-v1:<orderId>:<sha256 hex of
        reason>:<sha256 hex of photo bytes, or ->:<requestedAt>``. ``requestedAt`` must be within 15 minutes of now.
        Runs the fault check, then routes the money: a void inside the window, or a refund, merchant claim, return or
        human review after capture. Rate limited per visitor.

        Args:
            order_id: Undo order id.
            body: Why the shopper is undoing, an optional photo, and their signature.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The verdict and what happened to the money.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Refused, for example a bad signature.
                Not found. The resource is not in a state that allows this. The photo is over 4 MB. Valid shape, but the
                content can't be accepted. Too many requests from this visitor, or the free-tier budget is spent.
                PayPal, the catalog or the AI model failed. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(self._with_raw_response.undo_order(order_id, body, request_options=request_options))

    @property
    def with_raw_response(self) -> OrdersWithRawResponse:
        return self._with_raw_response


class AsyncOrders:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncOrdersWithRawResponse(client, server)

    async def get_order(self, order_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> OrderView:
        """The purchase, the live undo window, the mandate behind it, and its verified event chain. Each event carries
        its proof.

        Args:
            order_id: Undo order id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The order.

        Raises:
            ApiError: Not found. ``error`` is ``Error | RawError``."""
        return unwrap(await self._with_raw_response.get_order(order_id, request_options=request_options))

    async def get_order_evidence(
        self, order_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> Evidence:
        """Everything needed to check an order without trusting Undo: the raw hash-chained events exactly as hashed and
        the signed mandate exactly as stored. Nothing is pre-verified, on purpose.

        Args:
            order_id: Undo order id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The evidence file (``undo-evidence-v1``).

        Raises:
            ApiError: Not found. ``error`` is ``Error | RawError``."""
        return unwrap(await self._with_raw_response.get_order_evidence(order_id, request_options=request_options))

    async def undo_order(
        self,
        order_id: UUID,
        body: UndoRequest | UndoRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> UndoResult:
        """The Undo button. Must be signed by the mandate's shopper key over ``undo-request-v1:<orderId>:<sha256 hex of
        reason>:<sha256 hex of photo bytes, or ->:<requestedAt>``. ``requestedAt`` must be within 15 minutes of now.
        Runs the fault check, then routes the money: a void inside the window, or a refund, merchant claim, return or
        human review after capture. Rate limited per visitor.

        Args:
            order_id: Undo order id.
            body: Why the shopper is undoing, an optional photo, and their signature.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The verdict and what happened to the money.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Refused, for example a bad signature.
                Not found. The resource is not in a state that allows this. The photo is over 4 MB. Valid shape, but the
                content can't be accepted. Too many requests from this visitor, or the free-tier budget is spent.
                PayPal, the catalog or the AI model failed. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(await self._with_raw_response.undo_order(order_id, body, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncOrdersWithRawResponse:
        return self._with_raw_response


class OrdersWithRawResponse(BaseRawResponse[RawClient, Server]):
    def get_order(
        self, order_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[OrderView, GetOrderErrorBody]:
        """The purchase, the live undo window, the mandate behind it, and its verified event chain. Each event carries
        its proof.

        Args:
            order_id: Undo order id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/orders/{orderId}"),
            path_params=[param[UUID]("orderId", order_id)],
            decoder=json_decoder[OrderView],
            error_mapper=get_order_error_mapper,
            request_options=request_options,
        )

    def get_order_evidence(
        self, order_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Evidence, GetOrderEvidenceErrorBody]:
        """Everything needed to check an order without trusting Undo: the raw hash-chained events exactly as hashed and
        the signed mandate exactly as stored. Nothing is pre-verified, on purpose.

        Args:
            order_id: Undo order id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/orders/{orderId}/evidence"),
            path_params=[param[UUID]("orderId", order_id)],
            decoder=json_decoder[Evidence],
            error_mapper=get_order_evidence_error_mapper,
            request_options=request_options,
        )

    def undo_order(
        self,
        order_id: UUID,
        body: UndoRequest | UndoRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[UndoResult, UndoOrderErrorBody]:
        """The Undo button. Must be signed by the mandate's shopper key over ``undo-request-v1:<orderId>:<sha256 hex of
        reason>:<sha256 hex of photo bytes, or ->:<requestedAt>``. ``requestedAt`` must be within 15 minutes of now.
        Runs the fault check, then routes the money: a void inside the window, or a refund, merchant claim, return or
        human review after capture. Rate limited per visitor.

        Args:
            order_id: Undo order id.
            body: Why the shopper is undoing, an optional photo, and their signature.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/orders/{orderId}/undo"),
            path_params=[param[UUID]("orderId", order_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[UndoRequest | UndoRequestDict](body),
            decoder=json_decoder[UndoResult],
            error_mapper=undo_order_error_mapper,
            request_options=request_options,
        )


class AsyncOrdersWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def get_order(
        self, order_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[OrderView, GetOrderErrorBody]:
        """The purchase, the live undo window, the mandate behind it, and its verified event chain. Each event carries
        its proof.

        Args:
            order_id: Undo order id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/orders/{orderId}"),
            path_params=[param[UUID]("orderId", order_id)],
            decoder=async_json_decoder[OrderView],
            error_mapper=get_order_error_mapper,
            request_options=request_options,
        )

    async def get_order_evidence(
        self, order_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Evidence, GetOrderEvidenceErrorBody]:
        """Everything needed to check an order without trusting Undo: the raw hash-chained events exactly as hashed and
        the signed mandate exactly as stored. Nothing is pre-verified, on purpose.

        Args:
            order_id: Undo order id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/orders/{orderId}/evidence"),
            path_params=[param[UUID]("orderId", order_id)],
            decoder=async_json_decoder[Evidence],
            error_mapper=get_order_evidence_error_mapper,
            request_options=request_options,
        )

    async def undo_order(
        self,
        order_id: UUID,
        body: UndoRequest | UndoRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[UndoResult, UndoOrderErrorBody]:
        """The Undo button. Must be signed by the mandate's shopper key over ``undo-request-v1:<orderId>:<sha256 hex of
        reason>:<sha256 hex of photo bytes, or ->:<requestedAt>``. ``requestedAt`` must be within 15 minutes of now.
        Runs the fault check, then routes the money: a void inside the window, or a refund, merchant claim, return or
        human review after capture. Rate limited per visitor.

        Args:
            order_id: Undo order id.
            body: Why the shopper is undoing, an optional photo, and their signature.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/orders/{orderId}/undo"),
            path_params=[param[UUID]("orderId", order_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[UndoRequest | UndoRequestDict](body),
            decoder=async_json_decoder[UndoResult],
            error_mapper=undo_order_error_mapper,
            request_options=request_options,
        )
