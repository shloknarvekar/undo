from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel


class MerchantRules(SdkBaseModel):
    """The store's rules for agents. They apply from the next checkout."""

    block_below: int | None = Field(alias="blockBelow")
    """Refuse agents scoring below this. Null turns it off."""

    extend_below: int | None = Field(alias="extendBelow")
    """Give agents scoring below this a longer window. Null turns it off."""

    extend_minutes: int = Field(alias="extendMinutes")
    """How much longer."""

    block_unverified: bool = Field(alias="blockUnverified")
    """Refuse agents without a registered operator key."""


class MerchantRulesDict(TypedDict):
    block_below: int | None
    extend_below: int | None
    extend_minutes: int
    block_unverified: bool
