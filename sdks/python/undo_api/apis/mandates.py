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
from ..errors.draft_mandate_error import DraftMandateErrorBody, draft_mandate_error_mapper
from ..errors.get_mandate_error import GetMandateErrorBody, get_mandate_error_mapper
from ..errors.prepare_mandate_error import PrepareMandateErrorBody, prepare_mandate_error_mapper
from ..errors.store_mandate_error import StoreMandateErrorBody, store_mandate_error_mapper
from ..models.draft_mandate_request import DraftMandateRequest, DraftMandateRequestDict
from ..models.draft_result import DraftResult
from ..models.mandate_view import MandateView
from ..models.prepare_mandate import PrepareMandate, PrepareMandateDict
from ..models.prepared_mandate import PreparedMandate
from ..models.signed_mandate import SignedMandate, SignedMandateDict
from ..models.stored_mandate import StoredMandate
from ..server.server import Server


class Mandates:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = MandatesWithRawResponse(client, server)

    def draft_mandate(
        self,
        body: DraftMandateRequest | DraftMandateRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> DraftResult:
        """Turns a plain request into structured limits for the shopper to review. Nothing is stored. Rate limited per
        visitor.

        Args:
            body: The shopper's request in their own words.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The draft and whether it can be signed as is.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Too many requests from this visitor, or
                the free-tier budget is spent. PayPal, the catalog or the AI model failed. The AI model is unavailable
                right now. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(self._with_raw_response.draft_mandate(body, request_options=request_options))

    def get_mandate(self, mandate_id: UUID, *, request_options: RequestOptionsOrDict | None = None) -> MandateView:
        """The mandate, its status, the search it permits, and a fresh check of its digest, signature and event chain.

        Args:
            mandate_id: Mandate id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The mandate with a live integrity check.

        Raises:
            ApiError: Not found. ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.get_mandate(mandate_id, request_options=request_options))

    def prepare_mandate(
        self, body: PrepareMandate | PrepareMandateDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> PreparedMandate:
        """Returns the mandate the shopper's device must sign and the exact ``signingMessage``
        (``undo-intent-mandate-v1:<sha256 of the canonical mandate JSON>``). Stateless; nothing is stored.

        Args:
            body: The draft, the shopper's words and the device key that will sign.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The mandate and the string to sign.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. The draft still has open questions or
                no budget. ``error`` is ``Error | NotReady | RawError``."""
        return unwrap(self._with_raw_response.prepare_mandate(body, request_options=request_options))

    def store_mandate(
        self, body: SignedMandate | SignedMandateDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> StoredMandate:
        """Re-verifies the signature, freshness, expiry and readiness, then writes the first event of the mandate's hash
        chain.

        Args:
            body: The mandate and the shopper's signature over it.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Stored.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Refused, for example a bad signature.
                The resource is not in a state that allows this. Valid shape, but the content can't be accepted.
                ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.store_mandate(body, request_options=request_options))

    @property
    def with_raw_response(self) -> MandatesWithRawResponse:
        return self._with_raw_response


class AsyncMandates:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncMandatesWithRawResponse(client, server)

    async def draft_mandate(
        self,
        body: DraftMandateRequest | DraftMandateRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> DraftResult:
        """Turns a plain request into structured limits for the shopper to review. Nothing is stored. Rate limited per
        visitor.

        Args:
            body: The shopper's request in their own words.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The draft and whether it can be signed as is.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Too many requests from this visitor, or
                the free-tier budget is spent. PayPal, the catalog or the AI model failed. The AI model is unavailable
                right now. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(await self._with_raw_response.draft_mandate(body, request_options=request_options))

    async def get_mandate(
        self, mandate_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> MandateView:
        """The mandate, its status, the search it permits, and a fresh check of its digest, signature and event chain.

        Args:
            mandate_id: Mandate id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The mandate with a live integrity check.

        Raises:
            ApiError: Not found. ``error`` is ``Error | RawError``."""
        return unwrap(await self._with_raw_response.get_mandate(mandate_id, request_options=request_options))

    async def prepare_mandate(
        self, body: PrepareMandate | PrepareMandateDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> PreparedMandate:
        """Returns the mandate the shopper's device must sign and the exact ``signingMessage``
        (``undo-intent-mandate-v1:<sha256 of the canonical mandate JSON>``). Stateless; nothing is stored.

        Args:
            body: The draft, the shopper's words and the device key that will sign.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The mandate and the string to sign.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. The draft still has open questions or
                no budget. ``error`` is ``Error | NotReady | RawError``."""
        return unwrap(await self._with_raw_response.prepare_mandate(body, request_options=request_options))

    async def store_mandate(
        self, body: SignedMandate | SignedMandateDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> StoredMandate:
        """Re-verifies the signature, freshness, expiry and readiness, then writes the first event of the mandate's hash
        chain.

        Args:
            body: The mandate and the shopper's signature over it.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Stored.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Refused, for example a bad signature.
                The resource is not in a state that allows this. Valid shape, but the content can't be accepted.
                ``error`` is ``Error | RawError``."""
        return unwrap(await self._with_raw_response.store_mandate(body, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncMandatesWithRawResponse:
        return self._with_raw_response


class MandatesWithRawResponse(BaseRawResponse[RawClient, Server]):
    def draft_mandate(
        self,
        body: DraftMandateRequest | DraftMandateRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[DraftResult, DraftMandateErrorBody]:
        """Turns a plain request into structured limits for the shopper to review. Nothing is stored. Rate limited per
        visitor.

        Args:
            body: The shopper's request in their own words.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandates/draft"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[DraftMandateRequest | DraftMandateRequestDict](body),
            decoder=json_decoder[DraftResult],
            error_mapper=draft_mandate_error_mapper,
            request_options=request_options,
        )

    def get_mandate(
        self, mandate_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MandateView, GetMandateErrorBody]:
        """The mandate, its status, the search it permits, and a fresh check of its digest, signature and event chain.

        Args:
            mandate_id: Mandate id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/mandates/{mandateId}"),
            path_params=[param[UUID]("mandateId", mandate_id)],
            decoder=json_decoder[MandateView],
            error_mapper=get_mandate_error_mapper,
            request_options=request_options,
        )

    def prepare_mandate(
        self, body: PrepareMandate | PrepareMandateDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[PreparedMandate, PrepareMandateErrorBody]:
        """Returns the mandate the shopper's device must sign and the exact ``signingMessage``
        (``undo-intent-mandate-v1:<sha256 of the canonical mandate JSON>``). Stateless; nothing is stored.

        Args:
            body: The draft, the shopper's words and the device key that will sign.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandates/prepare"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[PrepareMandate | PrepareMandateDict](body),
            decoder=json_decoder[PreparedMandate],
            error_mapper=prepare_mandate_error_mapper,
            request_options=request_options,
        )

    def store_mandate(
        self, body: SignedMandate | SignedMandateDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[StoredMandate, StoreMandateErrorBody]:
        """Re-verifies the signature, freshness, expiry and readiness, then writes the first event of the mandate's hash
        chain.

        Args:
            body: The mandate and the shopper's signature over it.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandates"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[SignedMandate | SignedMandateDict](body),
            decoder=json_decoder[StoredMandate],
            error_mapper=store_mandate_error_mapper,
            request_options=request_options,
        )


class AsyncMandatesWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def draft_mandate(
        self,
        body: DraftMandateRequest | DraftMandateRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[DraftResult, DraftMandateErrorBody]:
        """Turns a plain request into structured limits for the shopper to review. Nothing is stored. Rate limited per
        visitor.

        Args:
            body: The shopper's request in their own words.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandates/draft"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[DraftMandateRequest | DraftMandateRequestDict](body),
            decoder=async_json_decoder[DraftResult],
            error_mapper=draft_mandate_error_mapper,
            request_options=request_options,
        )

    async def get_mandate(
        self, mandate_id: UUID, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MandateView, GetMandateErrorBody]:
        """The mandate, its status, the search it permits, and a fresh check of its digest, signature and event chain.

        Args:
            mandate_id: Mandate id.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/mandates/{mandateId}"),
            path_params=[param[UUID]("mandateId", mandate_id)],
            decoder=async_json_decoder[MandateView],
            error_mapper=get_mandate_error_mapper,
            request_options=request_options,
        )

    async def prepare_mandate(
        self, body: PrepareMandate | PrepareMandateDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[PreparedMandate, PrepareMandateErrorBody]:
        """Returns the mandate the shopper's device must sign and the exact ``signingMessage``
        (``undo-intent-mandate-v1:<sha256 of the canonical mandate JSON>``). Stateless; nothing is stored.

        Args:
            body: The draft, the shopper's words and the device key that will sign.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandates/prepare"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[PrepareMandate | PrepareMandateDict](body),
            decoder=async_json_decoder[PreparedMandate],
            error_mapper=prepare_mandate_error_mapper,
            request_options=request_options,
        )

    async def store_mandate(
        self, body: SignedMandate | SignedMandateDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[StoredMandate, StoreMandateErrorBody]:
        """Re-verifies the signature, freshness, expiry and readiness, then writes the first event of the mandate's hash
        chain.

        Args:
            body: The mandate and the shopper's signature over it.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/mandates"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[SignedMandate | SignedMandateDict](body),
            decoder=async_json_decoder[StoredMandate],
            error_mapper=store_mandate_error_mapper,
            request_options=request_options,
        )
