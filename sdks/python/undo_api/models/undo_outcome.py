from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.order_status import OrderStatusOrStr
from .money_action import MoneyAction, MoneyActionDict


class UndoOutcome(SdkBaseModel):
    """What happened to the money and the order's new status."""

    action: MoneyAction
    """What happens to the money after the verdict."""

    status: OrderStatusOrStr
    """Where an order stands. AUTHORIZED means the money is only held and Undo is a free void."""

    paypal: dict[str, str | None]
    """The PayPal ids behind the money movement."""

    evidence_digest: Optional[str] = Field(default=UNSET, alias="evidenceDigest")
    """SHA-256 of the evidence pack sent with a merchant claim."""


class UndoOutcomeDict(TypedDict):
    action: MoneyActionDict
    status: OrderStatusOrStr
    paypal: dict[str, str | None]
    evidence_digest: NotRequired[str]
