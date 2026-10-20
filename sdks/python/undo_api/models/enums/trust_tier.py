from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class TrustTier(str, Enum):
    """An agent's trust band."""

    TRUSTED = "trusted"
    NEUTRAL = "neutral"
    RISKY = "risky"

    __str__ = str.__str__


TrustTierOrStr: TypeAlias = Annotated[TrustTier | str, open_enum_validator(TrustTier)]
