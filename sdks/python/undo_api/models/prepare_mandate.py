from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.pay_with import PayWithOrStr
from .intent_draft import IntentDraft, IntentDraftDict


class PrepareMandate(SdkBaseModel):
    """What's needed to build the exact mandate a device will sign."""

    request: str
    """The shopper's request in their own words, kept verbatim inside the mandate."""

    draft: IntentDraft
    """The shopper's limits in structured form."""

    shopper_key: str = Field(alias="shopperKey")
    """Base64 Ed25519 public key."""

    pay_with: Optional[PayWithOrStr] = Field(default=UNSET, alias="payWith")
    """How the agent may pay."""


class PrepareMandateDict(TypedDict):
    request: str
    draft: IntentDraftDict
    shopper_key: str
    pay_with: NotRequired[PayWithOrStr]
