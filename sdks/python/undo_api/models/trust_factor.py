from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class TrustFactor(SdkBaseModel):
    """One part of an agent's trust score."""

    label: str
    """What earned or cost points."""

    points: int
    """Points added (negative when taken away)."""


class TrustFactorDict(TypedDict):
    label: str
    points: int
