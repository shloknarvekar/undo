from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class SignActionName(str, Enum):
    """Always sign."""

    SIGN = "sign"

    __str__ = str.__str__


SignActionNameOrStr: TypeAlias = Annotated[SignActionName | str, open_enum_validator(SignActionName)]
