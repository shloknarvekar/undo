from __future__ import annotations

from uuid import UUID

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .intent_draft import IntentDraft, IntentDraftDict


class MandateSummary(SdkBaseModel):
    """The mandate this purchase was made under."""

    id: Optional[UUID] = UNSET
    """Mandate id."""

    request: Optional[str] = UNSET
    """The shopper's request in their own words."""

    intent: Optional[IntentDraft] = UNSET
    """The shopper's limits in structured form."""

    status: Optional[str] = UNSET
    """Mandate status."""

    shopper_key: Optional[str] = Field(default=UNSET, alias="shopperKey")
    """The shopper's public key. Undo requests must be signed by it."""


class MandateSummaryDict(TypedDict):
    id: NotRequired[UUID]
    request: NotRequired[str]
    intent: NotRequired[IntentDraftDict]
    status: NotRequired[str]
    shopper_key: NotRequired[str]
