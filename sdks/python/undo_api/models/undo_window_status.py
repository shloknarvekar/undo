from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, RFC3339DateTime, SdkBaseModel
from .undo_window_factor import UndoWindowFactor, UndoWindowFactorDict


class UndoWindowStatus(SdkBaseModel):
    """The undo window on an order: how long, why, and whether it is still open."""

    minutes: int
    """Total window length."""

    factors: list[UndoWindowFactor]
    """Why the window is this long, factor by factor."""

    ends_at: OptionalNullable[RFC3339DateTime] = Field(default=UNSET, alias="endsAt")
    """When the window closes."""

    open: bool
    """True while the money is only held and the window hasn't closed: Undo is a free void."""

    minutes_left: OptionalNullable[int] = Field(default=UNSET, alias="minutesLeft")
    """Minutes until the window closes."""


class UndoWindowStatusDict(TypedDict):
    minutes: int
    factors: list[UndoWindowFactorDict]
    ends_at: NotRequired[RFC3339DateTime | None]
    open: bool
    minutes_left: NotRequired[int | None]
