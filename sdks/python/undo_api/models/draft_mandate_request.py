from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class DraftMandateRequest(SdkBaseModel):
    """The shopper's words to turn into a draft."""

    request: str
    """The shopper's own words."""


class DraftMandateRequestDict(TypedDict):
    request: str
