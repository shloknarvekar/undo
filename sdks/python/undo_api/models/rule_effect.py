from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, SdkBaseModel


class RuleEffect(SdkBaseModel):
    """What the store's rules do to this agent's next purchase."""

    blocked: str | None
    """Why the agent would be refused, or null."""

    extra_minutes: int = Field(alias="extraMinutes")
    """Extra undo-window minutes the rules add."""

    reason: OptionalNullable[str] = UNSET
    """Which rule added the time, or null."""


class RuleEffectDict(TypedDict):
    blocked: str | None
    extra_minutes: int
    reason: NotRequired[str | None]
