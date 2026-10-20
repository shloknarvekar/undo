from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Liability(str, Enum):
    """Who pays. Null when a person still has to decide."""

    AGENT_OPERATOR = "agent_operator"
    MERCHANT = "merchant"
    SHOPPER = "shopper"

    __str__ = str.__str__


LiabilityOrStr: TypeAlias = Annotated[Liability | str, open_enum_validator(Liability)]
