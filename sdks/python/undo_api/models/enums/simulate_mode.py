from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class SimulateMode(str, Enum):
    """Demo agents that misbehave on purpose."""

    UNGUARDED_WRONG_VARIANT = "unguarded_wrong_variant"

    __str__ = str.__str__


SimulateModeOrStr: TypeAlias = Annotated[SimulateMode | str, open_enum_validator(SimulateMode)]
