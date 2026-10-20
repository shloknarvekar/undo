from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, RFC3339DateTime, SdkBaseModel


class ActivityEvent(SdkBaseModel):
    """One recorded step in the store's activity."""

    id: int
    """Event id. Pass the newest one as after to get only newer events."""

    at: RFC3339DateTime
    """When it happened."""

    type_: str = Field(alias="type")
    """Event type, for example PAYMENT_VOIDED."""

    kind: str
    """Who or what decided this step: shopper, agent, rules, AI or PayPal."""

    how: str
    """How the step was decided, in plain words."""

    order_id: OptionalNullable[str] = Field(default=UNSET, alias="orderId")
    """The order it belongs to, when there is one."""

    amount: OptionalNullable[float] = UNSET
    """Money involved, when there is any."""

    agent: OptionalNullable[str] = UNSET
    """The agent operator involved, when there is one."""

    ref: OptionalNullable[str] = UNSET
    """The PayPal id or call behind the step, when there is one."""


class ActivityEventDict(TypedDict):
    id: int
    at: RFC3339DateTime
    type_: str
    kind: str
    how: str
    order_id: NotRequired[str | None]
    amount: NotRequired[float | None]
    agent: NotRequired[str | None]
    ref: NotRequired[str | None]
