from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.simulate_mode import SimulateModeOrStr


class ShopMandateRequest(SdkBaseModel):
    """Options for a shopping run. Send an empty object for a normal run."""

    simulate: Optional[SimulateModeOrStr] = UNSET
    """Demo agents that misbehave on purpose."""


class ShopMandateRequestDict(TypedDict):
    simulate: NotRequired[SimulateModeOrStr]
