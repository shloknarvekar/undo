from __future__ import annotations

from uuid import UUID, uuid4

from ..core import (
    ApiResult,
    AsyncRawClient,
    BaseRawResponse,
    RawClient,
    RawError,
    RequestOptionsOrDict,
    async_json_decoder,
    json_body,
    json_decoder,
    param,
    raw_error_response,
    unwrap,
)
from ..errors.resolve_order_error import ResolveOrderErrorBody, resolve_order_error_mapper
from ..errors.update_merchant_rules_error import UpdateMerchantRulesErrorBody, update_merchant_rules_error_mapper
from ..models.activity_feed import ActivityFeed
from ..models.merchant_agents import MerchantAgents
from ..models.merchant_orders import MerchantOrders
from ..models.merchant_rules import MerchantRules, MerchantRulesDict
from ..models.resolve_order_request import ResolveOrderRequest, ResolveOrderRequestDict
from ..models.resolve_order_result import ResolveOrderResult
from ..server.server import Server


class Merchant:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = MerchantWithRawResponse(client, server)

    def get_merchant_rules(self, *, request_options: RequestOptionsOrDict | None = None) -> MerchantRules:
        """The rules the store applies to agents at checkout: block below a trust score, lengthen the undo window below
        a score, or accept only registered operators.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The rules.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(self._with_raw_response.get_merchant_rules(request_options=request_options))

    def list_merchant_activity(
        self, *, after: int | None = None, request_options: RequestOptionsOrDict | None = None
    ) -> ActivityFeed:
        """Every step Undo records, newest first (up to 60). Pass ``after`` to get only events newer than that id.

        Args:
            after: Only events with an id greater than this.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Activity events.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(self._with_raw_response.list_merchant_activity(after=after, request_options=request_options))

    def list_merchant_agents(self, *, request_options: RequestOptionsOrDict | None = None) -> MerchantAgents:
        """Every agent that has shopped here, its record and trust score with every point explained, and what the
        store's rules do to it.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Agents and the store's rules.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(self._with_raw_response.list_merchant_agents(request_options=request_options))

    def list_merchant_orders(self, *, request_options: RequestOptionsOrDict | None = None) -> MerchantOrders:
        """Every agent order (latest 300) with its verdict, who pays and any agent payout, plus headline numbers.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Orders and KPIs.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(self._with_raw_response.list_merchant_orders(request_options=request_options))

    def resolve_order(
        self,
        order_id: UUID,
        body: ResolveOrderRequest | ResolveOrderRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ResolveOrderResult:
        """The merchant's side of an Undo. Sandbox only.

        Args:
            order_id: Undo order id.
            body: The merchant's decision.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Done; the body describes the PayPal actions taken.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Refused, for example a bad signature.
                Not found. The resource is not in a state that allows this. PayPal, the catalog or the AI model failed.
                ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.resolve_order(order_id, body, request_options=request_options))

    def update_merchant_rules(
        self, body: MerchantRules | MerchantRulesDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> MerchantRules:
        """Applies from the next checkout, for Undo's agent and every MCP agent. Each change is recorded in the store's
        event chain.

        Args:
            body: The rules to apply from the next checkout.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The rules now in force.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Too many requests from this visitor, or
                the free-tier budget is spent. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(self._with_raw_response.update_merchant_rules(body, request_options=request_options))

    @property
    def with_raw_response(self) -> MerchantWithRawResponse:
        return self._with_raw_response


class AsyncMerchant:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncMerchantWithRawResponse(client, server)

    async def get_merchant_rules(self, *, request_options: RequestOptionsOrDict | None = None) -> MerchantRules:
        """The rules the store applies to agents at checkout: block below a trust score, lengthen the undo window below
        a score, or accept only registered operators.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The rules.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(await self._with_raw_response.get_merchant_rules(request_options=request_options))

    async def list_merchant_activity(
        self, *, after: int | None = None, request_options: RequestOptionsOrDict | None = None
    ) -> ActivityFeed:
        """Every step Undo records, newest first (up to 60). Pass ``after`` to get only events newer than that id.

        Args:
            after: Only events with an id greater than this.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Activity events.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(
            await self._with_raw_response.list_merchant_activity(after=after, request_options=request_options)
        )

    async def list_merchant_agents(self, *, request_options: RequestOptionsOrDict | None = None) -> MerchantAgents:
        """Every agent that has shopped here, its record and trust score with every point explained, and what the
        store's rules do to it.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Agents and the store's rules.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(await self._with_raw_response.list_merchant_agents(request_options=request_options))

    async def list_merchant_orders(self, *, request_options: RequestOptionsOrDict | None = None) -> MerchantOrders:
        """Every agent order (latest 300) with its verdict, who pays and any agent payout, plus headline numbers.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Orders and KPIs.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(await self._with_raw_response.list_merchant_orders(request_options=request_options))

    async def resolve_order(
        self,
        order_id: UUID,
        body: ResolveOrderRequest | ResolveOrderRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ResolveOrderResult:
        """The merchant's side of an Undo. Sandbox only.

        Args:
            order_id: Undo order id.
            body: The merchant's decision.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Done; the body describes the PayPal actions taken.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Refused, for example a bad signature.
                Not found. The resource is not in a state that allows this. PayPal, the catalog or the AI model failed.
                ``error`` is ``Error | RawError``."""
        return unwrap(await self._with_raw_response.resolve_order(order_id, body, request_options=request_options))

    async def update_merchant_rules(
        self, body: MerchantRules | MerchantRulesDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> MerchantRules:
        """Applies from the next checkout, for Undo's agent and every MCP agent. Each change is recorded in the store's
        event chain.

        Args:
            body: The rules to apply from the next checkout.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The rules now in force.

        Raises:
            ApiError: The body failed validation; ``issues`` lists each problem. Too many requests from this visitor, or
                the free-tier budget is spent. ``error`` is ``Error | RateLimited | RawError``."""
        return unwrap(await self._with_raw_response.update_merchant_rules(body, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncMerchantWithRawResponse:
        return self._with_raw_response


class MerchantWithRawResponse(BaseRawResponse[RawClient, Server]):
    def get_merchant_rules(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MerchantRules, RawError]:
        """The rules the store applies to agents at checkout: block below a trust score, lengthen the undo window below
        a score, or accept only registered operators.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/merchant/rules"),
            decoder=json_decoder[MerchantRules],
            error_mapper=raw_error_response,
            request_options=request_options,
        )

    def list_merchant_activity(
        self, *, after: int | None = None, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ActivityFeed, RawError]:
        """Every step Undo records, newest first (up to 60). Pass ``after`` to get only events newer than that id.

        Args:
            after: Only events with an id greater than this.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/merchant/activity"),
            query_params=[param[int | None]("after", after)],
            decoder=json_decoder[ActivityFeed],
            error_mapper=raw_error_response,
            request_options=request_options,
        )

    def list_merchant_agents(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MerchantAgents, RawError]:
        """Every agent that has shopped here, its record and trust score with every point explained, and what the
        store's rules do to it.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/merchant/agents"),
            decoder=json_decoder[MerchantAgents],
            error_mapper=raw_error_response,
            request_options=request_options,
        )

    def list_merchant_orders(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MerchantOrders, RawError]:
        """Every agent order (latest 300) with its verdict, who pays and any agent payout, plus headline numbers.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/merchant/orders"),
            decoder=json_decoder[MerchantOrders],
            error_mapper=raw_error_response,
            request_options=request_options,
        )

    def resolve_order(
        self,
        order_id: UUID,
        body: ResolveOrderRequest | ResolveOrderRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ResolveOrderResult, ResolveOrderErrorBody]:
        """The merchant's side of an Undo. Sandbox only.

        Args:
            order_id: Undo order id.
            body: The merchant's decision.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/orders/{orderId}/resolve"),
            path_params=[param[UUID]("orderId", order_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[ResolveOrderRequest | ResolveOrderRequestDict](body),
            decoder=json_decoder[ResolveOrderResult],
            error_mapper=resolve_order_error_mapper,
            request_options=request_options,
        )

    def update_merchant_rules(
        self, body: MerchantRules | MerchantRulesDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MerchantRules, UpdateMerchantRulesErrorBody]:
        """Applies from the next checkout, for Undo's agent and every MCP agent. Each change is recorded in the store's
        event chain.

        Args:
            body: The rules to apply from the next checkout.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="PUT",
            url_template=self._server.default("/api/merchant/rules"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[MerchantRules | MerchantRulesDict](body),
            decoder=json_decoder[MerchantRules],
            error_mapper=update_merchant_rules_error_mapper,
            request_options=request_options,
        )


class AsyncMerchantWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def get_merchant_rules(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MerchantRules, RawError]:
        """The rules the store applies to agents at checkout: block below a trust score, lengthen the undo window below
        a score, or accept only registered operators.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/merchant/rules"),
            decoder=async_json_decoder[MerchantRules],
            error_mapper=raw_error_response,
            request_options=request_options,
        )

    async def list_merchant_activity(
        self, *, after: int | None = None, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ActivityFeed, RawError]:
        """Every step Undo records, newest first (up to 60). Pass ``after`` to get only events newer than that id.

        Args:
            after: Only events with an id greater than this.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/merchant/activity"),
            query_params=[param[int | None]("after", after)],
            decoder=async_json_decoder[ActivityFeed],
            error_mapper=raw_error_response,
            request_options=request_options,
        )

    async def list_merchant_agents(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MerchantAgents, RawError]:
        """Every agent that has shopped here, its record and trust score with every point explained, and what the
        store's rules do to it.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/merchant/agents"),
            decoder=async_json_decoder[MerchantAgents],
            error_mapper=raw_error_response,
            request_options=request_options,
        )

    async def list_merchant_orders(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MerchantOrders, RawError]:
        """Every agent order (latest 300) with its verdict, who pays and any agent payout, plus headline numbers.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/merchant/orders"),
            decoder=async_json_decoder[MerchantOrders],
            error_mapper=raw_error_response,
            request_options=request_options,
        )

    async def resolve_order(
        self,
        order_id: UUID,
        body: ResolveOrderRequest | ResolveOrderRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ResolveOrderResult, ResolveOrderErrorBody]:
        """The merchant's side of an Undo. Sandbox only.

        Args:
            order_id: Undo order id.
            body: The merchant's decision.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/orders/{orderId}/resolve"),
            path_params=[param[UUID]("orderId", order_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[ResolveOrderRequest | ResolveOrderRequestDict](body),
            decoder=async_json_decoder[ResolveOrderResult],
            error_mapper=resolve_order_error_mapper,
            request_options=request_options,
        )

    async def update_merchant_rules(
        self, body: MerchantRules | MerchantRulesDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[MerchantRules, UpdateMerchantRulesErrorBody]:
        """Applies from the next checkout, for Undo's agent and every MCP agent. Each change is recorded in the store's
        event chain.

        Args:
            body: The rules to apply from the next checkout.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="PUT",
            url_template=self._server.default("/api/merchant/rules"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[MerchantRules | MerchantRulesDict](body),
            decoder=async_json_decoder[MerchantRules],
            error_mapper=update_merchant_rules_error_mapper,
            request_options=request_options,
        )
