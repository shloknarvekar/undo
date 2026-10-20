from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class UndoWindowFactor(SdkBaseModel):
    """One reason the undo window is as long as it is."""

    factor: str
    """What added time, in plain words."""

    minutes: int
    """Minutes it added."""


class UndoWindowFactorDict(TypedDict):
    factor: str
    minutes: int
