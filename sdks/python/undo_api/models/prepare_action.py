from __future__ import annotations

from typing import Literal

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.pay_with import PayWithOrStr


class PrepareAction(SdkBaseModel):
    """Build the exact mandate this device will sign."""

    action: Literal["prepare"] = "prepare"
    """Always prepare."""

    shopper_key: str = Field(alias="shopperKey")
    """Base64 Ed25519 public key of the device that will sign."""

    pay_with: Optional[PayWithOrStr] = Field(default=UNSET, alias="payWith")
    """How the agent may pay."""


class PrepareActionDict(TypedDict):
    action: Literal["prepare"]
    shopper_key: str
    pay_with: NotRequired[PayWithOrStr]
