from __future__ import annotations

from functools import cached_property
from types import TracebackType

from typing_extensions import Self

from .apis.mandate_requests import AsyncMandateRequests
from .apis.mandates import AsyncMandates
from .apis.merchant import AsyncMerchant
from .apis.orders import AsyncOrders
from .apis.products import AsyncProducts
from .apis.service import AsyncService
from .apis.shopping import AsyncShopping
from .base_client import DEFAULT_TIMEOUT, BaseUndoApiClient
from .core import (
    OPERATING_SYSTEM,
    PYTHON_RUNTIME,
    AsyncHttpClient,
    AsyncHttpx2Client,
    AsyncRawClient,
    LoggingOptionsOrDict,
    RetryOptionsOrDict,
    param,
)


class AsyncUndoApiClient(BaseUndoApiClient[AsyncRawClient]):
    def __init__(
        self,
        *,
        base_url: str | None = None,
        timeout: float = DEFAULT_TIMEOUT,
        retry_options: int | RetryOptionsOrDict | None = None,
        logging_options: LoggingOptionsOrDict | None = None,
        custom_async_http_client: AsyncHttpClient | None = None,
    ) -> None:
        super().__init__(
            base_url=base_url, timeout=timeout, retry_options=retry_options, logging_options=logging_options
        )
        self._raw_client = AsyncRawClient(
            http_client=(
                custom_async_http_client if custom_async_http_client is not None else AsyncHttpx2Client(timeout=timeout)
            ),
            retry_options=self._retry_options,
            logging_options=self._logging_options,
            global_headers=[
                param[str]("User-Agent", "UndoApiClient/1.0.0 Python"),
                param[str]("X-APIMatic-Lang", "Python"),
                param[str]("X-APIMatic-Package-Version", "1.0.0"),
                param[str]("X-APIMatic-Gen-Version", "4.0.0"),
                param[str]("X-APIMatic-OS", OPERATING_SYSTEM),
                param[str]("X-APIMatic-Runtime", PYTHON_RUNTIME),
            ],
        )

    @cached_property
    def mandate_requests(self) -> AsyncMandateRequests:
        return AsyncMandateRequests(self._raw_client, self._server)

    @cached_property
    def mandates(self) -> AsyncMandates:
        return AsyncMandates(self._raw_client, self._server)

    @cached_property
    def merchant(self) -> AsyncMerchant:
        return AsyncMerchant(self._raw_client, self._server)

    @cached_property
    def orders(self) -> AsyncOrders:
        return AsyncOrders(self._raw_client, self._server)

    @cached_property
    def products(self) -> AsyncProducts:
        return AsyncProducts(self._raw_client, self._server)

    @cached_property
    def service(self) -> AsyncService:
        return AsyncService(self._raw_client, self._server)

    @cached_property
    def shopping(self) -> AsyncShopping:
        return AsyncShopping(self._raw_client, self._server)

    async def aclose(self) -> None:
        await self._raw_client.http_client.aclose()

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(
        self, exc_type: type[BaseException] | None, exc: BaseException | None, exc_tb: TracebackType | None
    ) -> None:
        await self.aclose()


AsyncClient = AsyncUndoApiClient
