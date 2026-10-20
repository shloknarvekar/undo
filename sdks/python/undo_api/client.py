from __future__ import annotations

from functools import cached_property
from types import TracebackType

from typing_extensions import Self

from .apis.mandate_requests import MandateRequests
from .apis.mandates import Mandates
from .apis.merchant import Merchant
from .apis.orders import Orders
from .apis.products import Products
from .apis.service import Service
from .apis.shopping import Shopping
from .base_client import DEFAULT_TIMEOUT, BaseUndoApiClient
from .core import (
    OPERATING_SYSTEM,
    PYTHON_RUNTIME,
    HttpClient,
    Httpx2Client,
    LoggingOptionsOrDict,
    RawClient,
    RetryOptionsOrDict,
    param,
)


class UndoApiClient(BaseUndoApiClient[RawClient]):
    def __init__(
        self,
        *,
        base_url: str | None = None,
        timeout: float = DEFAULT_TIMEOUT,
        retry_options: int | RetryOptionsOrDict | None = None,
        logging_options: LoggingOptionsOrDict | None = None,
        custom_http_client: HttpClient | None = None,
    ) -> None:
        super().__init__(
            base_url=base_url, timeout=timeout, retry_options=retry_options, logging_options=logging_options
        )
        self._raw_client = RawClient(
            http_client=custom_http_client if custom_http_client is not None else Httpx2Client(timeout=timeout),
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
    def mandate_requests(self) -> MandateRequests:
        return MandateRequests(self._raw_client, self._server)

    @cached_property
    def mandates(self) -> Mandates:
        return Mandates(self._raw_client, self._server)

    @cached_property
    def merchant(self) -> Merchant:
        return Merchant(self._raw_client, self._server)

    @cached_property
    def orders(self) -> Orders:
        return Orders(self._raw_client, self._server)

    @cached_property
    def products(self) -> Products:
        return Products(self._raw_client, self._server)

    @cached_property
    def service(self) -> Service:
        return Service(self._raw_client, self._server)

    @cached_property
    def shopping(self) -> Shopping:
        return Shopping(self._raw_client, self._server)

    def close(self) -> None:
        self._raw_client.http_client.close()

    def __enter__(self) -> Self:
        return self

    def __exit__(
        self, exc_type: type[BaseException] | None, exc: BaseException | None, exc_tb: TracebackType | None
    ) -> None:
        self.close()


Client = UndoApiClient
