from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.not_ready_reason import NotReadyReasonOrStr


class NotReadyError(SdkBaseModel):
    """The draft can't be turned into a mandate yet."""

    error: NotReadyReasonOrStr
    """Why a draft can't be signed yet."""

    must_ask: Optional[list[str]] = Field(default=UNSET, alias="mustAsk")
    """The questions still to answer."""


class NotReadyErrorDict(TypedDict):
    error: NotReadyReasonOrStr
    must_ask: NotRequired[list[str]]
