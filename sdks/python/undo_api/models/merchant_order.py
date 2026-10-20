from __future__ import annotations

from uuid import UUID

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, RFC3339DateTime, SdkBaseModel
from .enums.order_status import OrderStatusOrStr


class MerchantOrder(SdkBaseModel):
    """One agent order as the store sees it."""

    id: UUID
    """Undo order id."""

    created_at: RFC3339DateTime = Field(alias="createdAt")
    """When the agent placed the order."""

    status: OrderStatusOrStr
    """Where an order stands. AUTHORIZED means the money is only held and Undo is a free void."""

    amount: float
    """Order total."""

    currency: str
    """ISO 4217 currency code."""

    product: str
    """Product title."""

    brand: OptionalNullable[str] = UNSET
    """Brand name, when known."""

    variant: Optional[str] = UNSET
    """The variant bought, for example Size M · Color Black."""

    image_url: OptionalNullable[str] = Field(default=UNSET, alias="imageUrl")
    """Product image URL, when there is one."""

    retailer: OptionalNullable[str] = UNSET
    """The retailer's domain."""

    request: OptionalNullable[str] = UNSET
    """The shopper's mandate, in their words."""

    agent_confidence: OptionalNullable[float] = Field(default=UNSET, alias="agentConfidence")
    """How sure the agent was that the item fits, from 0 to 1."""

    guard_bypassed: Optional[bool] = Field(default=UNSET, alias="guardBypassed")
    """True when the agent skipped Undo's checks before buying."""

    simulated: OptionalNullable[str] = UNSET
    """Set on demo orders from the careless test agent."""

    agent_name: str = Field(alias="agentName")
    """The agent operator's name."""

    agent_verified: bool = Field(alias="agentVerified")
    """Whether the operator presented a registered key."""

    agent_via: Optional[str] = Field(default=UNSET, alias="agentVia")
    """How the agent connected: web or mcp."""

    verdict: OptionalNullable[str] = UNSET
    """The fault check's verdict, after an Undo."""

    verdict_confidence: OptionalNullable[float] = Field(default=UNSET, alias="verdictConfidence")
    """How sure the verdict is, from 0 to 1."""

    liability: OptionalNullable[str] = UNSET
    """Who pays: agent_operator, merchant or shopper."""

    settlement: OptionalNullable[str] = UNSET
    """Status of the agent operator's payout to the store, when one was due."""

    settled_amount: Optional[float] = Field(default=UNSET, alias="settledAmount")
    """Money that arrived from an agent operator through PayPal Payouts."""

    action: OptionalNullable[str] = UNSET
    """What happened to the money, for example VOID or REFUND_FULL."""

    window_ends_at: OptionalNullable[RFC3339DateTime] = Field(default=UNSET, alias="windowEndsAt")
    """When the undo window closes or closed."""

    window_minutes_left: OptionalNullable[int] = Field(default=UNSET, alias="windowMinutesLeft")
    """Minutes left in the undo window, while the money is held."""

    paypal_ref: OptionalNullable[str] = Field(default=UNSET, alias="paypalRef")
    """The most specific PayPal id: capture, then authorization, then order."""


class MerchantOrderDict(TypedDict):
    id: UUID
    created_at: RFC3339DateTime
    status: OrderStatusOrStr
    amount: float
    currency: str
    product: str
    brand: NotRequired[str | None]
    variant: NotRequired[str]
    image_url: NotRequired[str | None]
    retailer: NotRequired[str | None]
    request: NotRequired[str | None]
    agent_confidence: NotRequired[float | None]
    guard_bypassed: NotRequired[bool]
    simulated: NotRequired[str | None]
    agent_name: str
    agent_verified: bool
    agent_via: NotRequired[str]
    verdict: NotRequired[str | None]
    verdict_confidence: NotRequired[float | None]
    liability: NotRequired[str | None]
    settlement: NotRequired[str | None]
    settled_amount: NotRequired[float]
    action: NotRequired[str | None]
    window_ends_at: NotRequired[RFC3339DateTime | None]
    window_minutes_left: NotRequired[int | None]
    paypal_ref: NotRequired[str | None]
