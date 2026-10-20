from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .intent_draft import IntentDraft, IntentDraftDict
from .ready_check import ReadyCheck, ReadyCheckDict


class DraftResult(SdkBaseModel):
    """A structured draft of the shopper's limits, ready for review."""

    request: Optional[str] = UNSET
    """The request text, when it was extended with answers."""

    draft: IntentDraft
    """The shopper's limits in structured form."""

    ready: ReadyCheck
    """Whether a draft can be signed as is."""


class DraftResultDict(TypedDict):
    request: NotRequired[str]
    draft: IntentDraftDict
    ready: ReadyCheckDict
