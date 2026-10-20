from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.money_action_type import MoneyActionTypeOrStr


class MoneyAction(SdkBaseModel):
    """What happens to the money after the verdict."""

    type_: MoneyActionTypeOrStr = Field(alias="type")
    """What happens to the money."""

    reason: str
    """Why, in plain words."""

    refund_on_return: Optional[str] = Field(default=UNSET, alias="refundOnReturn")
    """On AUTHORIZE_RETURN, the amount refunded when the item comes back."""

    restocking_fee: Optional[str] = Field(default=UNSET, alias="restockingFee")
    """On AUTHORIZE_RETURN."""


class MoneyActionDict(TypedDict):
    type_: MoneyActionTypeOrStr
    reason: str
    refund_on_return: NotRequired[str]
    restocking_fee: NotRequired[str]
