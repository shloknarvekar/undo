from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.trust_tier import TrustTierOrStr
from .trust_factor import TrustFactor, TrustFactorDict


class Trust(SdkBaseModel):
    """An agent's trust score at this store, with every point explained."""

    score: int
    """0 to 100, from the agent's record at this store."""

    tier: TrustTierOrStr
    """An agent's trust band."""

    factors: Optional[list[TrustFactor]] = UNSET
    """Every point in the score, explained."""


class TrustDict(TypedDict):
    score: int
    tier: TrustTierOrStr
    factors: NotRequired[list[TrustFactorDict]]
