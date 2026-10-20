from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .undo_window_factor import UndoWindowFactor, UndoWindowFactorDict


class UndoWindow(SdkBaseModel):
    """How long the shopper can undo for free, and why."""

    minutes: int
    """Total window length."""

    factors: list[UndoWindowFactor]
    """Why the window is this long, factor by factor."""


class UndoWindowDict(TypedDict):
    minutes: int
    factors: list[UndoWindowFactorDict]
