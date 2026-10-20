from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class PrepareActionName(str, Enum):
    """Always prepare."""

    PREPARE = "prepare"

    __str__ = str.__str__


PrepareActionNameOrStr: TypeAlias = Annotated[PrepareActionName | str, open_enum_validator(PrepareActionName)]
