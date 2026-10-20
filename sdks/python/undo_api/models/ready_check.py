from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.not_ready_reason import NotReadyReasonOrStr


class ReadyCheck(SdkBaseModel):
    """Whether a draft can be signed as is."""

    ok: bool
    """True when the draft can be signed as is."""

    reason: Optional[NotReadyReasonOrStr] = UNSET
    """Why a draft can't be signed yet."""


class ReadyCheckDict(TypedDict):
    ok: bool
    reason: NotRequired[NotReadyReasonOrStr]
