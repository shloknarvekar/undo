from __future__ import annotations

from ..core import (
    ApiResult,
    AsyncRawClient,
    BaseRawResponse,
    RawClient,
    RequestOptionsOrDict,
    async_json_decoder,
    json_decoder,
    param,
    unwrap,
)
from ..errors.get_health_error import GetHealthErrorBody, get_health_error_mapper
from ..models.health import Health
from ..server.server import Server


class Service:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = ServiceWithRawResponse(client, server)

    def get_health(self, *, deep: str | None = None, request_options: RequestOptionsOrDict | None = None) -> Health:
        """Shallow health check. With ``deep``, also proves the service can reach PayPal sandbox and the database. Never
        returns secret values.

        Args:
            deep: Present (any value) to also check PayPal and the database.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Healthy.

        Raises:
            ApiError: A deep check failed. ``error`` is ``Health | RawError``."""
        return unwrap(self._with_raw_response.get_health(deep=deep, request_options=request_options))

    @property
    def with_raw_response(self) -> ServiceWithRawResponse:
        return self._with_raw_response


class AsyncService:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncServiceWithRawResponse(client, server)

    async def get_health(
        self, *, deep: str | None = None, request_options: RequestOptionsOrDict | None = None
    ) -> Health:
        """Shallow health check. With ``deep``, also proves the service can reach PayPal sandbox and the database. Never
        returns secret values.

        Args:
            deep: Present (any value) to also check PayPal and the database.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Healthy.

        Raises:
            ApiError: A deep check failed. ``error`` is ``Health | RawError``."""
        return unwrap(await self._with_raw_response.get_health(deep=deep, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncServiceWithRawResponse:
        return self._with_raw_response


class ServiceWithRawResponse(BaseRawResponse[RawClient, Server]):
    def get_health(
        self, *, deep: str | None = None, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Health, GetHealthErrorBody]:
        """Shallow health check. With ``deep``, also proves the service can reach PayPal sandbox and the database. Never
        returns secret values.

        Args:
            deep: Present (any value) to also check PayPal and the database.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/health"),
            query_params=[param[str | None]("deep", deep)],
            decoder=json_decoder[Health],
            error_mapper=get_health_error_mapper,
            request_options=request_options,
        )


class AsyncServiceWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def get_health(
        self, *, deep: str | None = None, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Health, GetHealthErrorBody]:
        """Shallow health check. With ``deep``, also proves the service can reach PayPal sandbox and the database. Never
        returns secret values.

        Args:
            deep: Present (any value) to also check PayPal and the database.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/health"),
            query_params=[param[str | None]("deep", deep)],
            decoder=async_json_decoder[Health],
            error_mapper=get_health_error_mapper,
            request_options=request_options,
        )
