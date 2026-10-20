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
from ..errors.act_on_mandate_request_error import ActOnMandateRequestErrorBody, act_on_mandate_request_error_mapper
from ..errors.get_mandate_request_error import GetMandateRequestErrorBody, get_mandate_request_error_mapper
from ..models.mandate_request import MandateRequest
from ..models.unions.mandate_request_action import MandateRequestAction, MandateRequestActionDict
from ..models.unions.mandate_request_action_result import MandateRequestActionResult
from ..server.server import Server


class MandateRequests:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = MandateRequestsWithRawResponse(client, server)

    def act_on_mandate_request(
        self,
        request_id: UUID,
        body: MandateRequestAction | MandateRequestActionDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> MandateRequestActionResult:
        """- ``answer``: answers the agent's open questions; the draft is re-read from the new text.
        - ``prepare``: the exact mandate this device's key must sign.
        - ``sign``: stores the signed mandate; it must match the request byte for byte (same words, limits and agent).

        Args:
            request_id: Mandate request id.
            body: The shopper's answer, a request to prepare the mandate, or the signed mandate.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Answered (new draft) or prepared (mandate and signing message).

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Not found. The resource is not in a
                state that allows this. Valid shape, but the content can't be accepted. Too many requests from this
                visitor, or the free-tier budget is spent. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(self._with_raw_response.act_on_mandate_request(request_id, body, request_options=request_options))

    def get_mandate_request(
        self, request_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> MandateRequest:
        """The draft an outside agent asked the shopper to sign, who is asking, and whether it is signed yet.

        Args:
            request_id: Mandate request id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The request.

        Raises:
            ApiError: Not found. ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.get_mandate_request(request_id, request_options=request_options))

    @property
    def with_raw_response(self) -> MandateRequestsWithRawResponse:
        return self._with_raw_response


class AsyncMandateRequests:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncMandateRequestsWithRawResponse(client, server)

    async def act_on_mandate_request(
        self,
        request_id: UUID,
        body: MandateRequestAction | MandateRequestActionDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> MandateRequestActionResult:
        """- ``answer``: answers the agent's open questions; the draft is re-read from the new text.
        - ``prepare``: the exact mandate this device's key must sign.
        - ``sign``: stores the signed mandate; it must match the request byte for byte (same words, limits and agent).

        Args:
            request_id: Mandate request id.
            body: The shopper's answer, a request to prepare the mandate, or the signed mandate.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Answered (new draft) or prepared (mandate and signing message).

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Not found. The resource is not in a
                state that allows this. Valid shape, but the content can't be accepted. Too many requests from this
                visitor, or the free-tier budget is spent. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(
            await self._with_raw_response.act_on_mandate_request(request_id, body, request_options=request_options)
        )

    async def get_mandate_request(
        self, request_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> MandateRequest:
        """The draft an outside agent asked the shopper to sign, who is asking, and whether it is signed yet.

        Args:
            request_id: Mandate request id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The request.

        Raises:
            ApiError: Not found. ``error`` is ``Error | RawError``."""
        return unwrap(await self._with_raw_response.get_mandate_request(request_id, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncMandateRequestsWithRawResponse:
        return self._with_raw_response


class MandateRequestsWithRawResponse(BaseRawResponse[RawClient, Server]):
    def act_on_mandate_request(
        self,
        request_id: UUID,
        body: MandateRequestAction | MandateRequestActionDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[MandateRequestActionResult, ActOnMandateRequestErrorBody]:
        """- ``answer``: answers the agent's open questions; the draft is re-read from the new text.
        - ``prepare``: the exact mandate this device's key must sign.
        - ``sign``: stores the signed mandate; it must match the request byte for byte (same words, limits and agent).

        Args:
            request_id: Mandate request id.
            body: The shopper's answer, a request to prepare the mandate, or the signed mandate.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandate-requests/{requestId}"),
            path_params=[param[UUID]("requestId", request_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[MandateRequestAction | MandateRequestActionDict](body),
            decoder=json_decoder[MandateRequestActionResult],
            error_mapper=act_on_mandate_request_error_mapper,
            request_options=request_options,
        )

    def get_mandate_request(
        self, request_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MandateRequest, GetMandateRequestErrorBody]:
        """The draft an outside agent asked the shopper to sign, who is asking, and whether it is signed yet.

        Args:
            request_id: Mandate request id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/mandate-requests/{requestId}"),
            path_params=[param[UUID]("requestId", request_id)],
            decoder=json_decoder[MandateRequest],
            error_mapper=get_mandate_request_error_mapper,
            request_options=request_options,
        )


class AsyncMandateRequestsWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def act_on_mandate_request(
        self,
        request_id: UUID,
        body: MandateRequestAction | MandateRequestActionDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[MandateRequestActionResult, ActOnMandateRequestErrorBody]:
        """- ``answer``: answers the agent's open questions; the draft is re-read from the new text.
        - ``prepare``: the exact mandate this device's key must sign.
        - ``sign``: stores the signed mandate; it must match the request byte for byte (same words, limits and agent).

        Args:
            request_id: Mandate request id.
            body: The shopper's answer, a request to prepare the mandate, or the signed mandate.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandate-requests/{requestId}"),
            path_params=[param[UUID]("requestId", request_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[MandateRequestAction | MandateRequestActionDict](body),
            decoder=async_json_decoder[MandateRequestActionResult],
            error_mapper=act_on_mandate_request_error_mapper,
            request_options=request_options,
        )

    async def get_mandate_request(
        self, request_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MandateRequest, GetMandateRequestErrorBody]:
        """The draft an outside agent asked the shopper to sign, who is asking, and whether it is signed yet.

        Args:
            request_id: Mandate request id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/mandate-requests/{requestId}"),
            path_params=[param[UUID]("requestId", request_id)],
            decoder=async_json_decoder[MandateRequest],
            error_mapper=get_mandate_request_error_mapper,
            request_options=request_options,
        )
