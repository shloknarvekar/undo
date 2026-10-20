from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class RateLimitCode(str, Enum):
    """The error code on a 429."""

    RATE_LIMITED = "rate_limited"

    __str__ = str.__str__


RateLimitCodeOrStr: TypeAlias = Annotated[RateLimitCode | str, open_enum_validator(RateLimitCode)]
