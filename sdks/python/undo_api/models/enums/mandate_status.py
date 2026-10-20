from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class MandateStatus(str, Enum):
    """Where a mandate stands."""

    ACTIVE = "ACTIVE"
    FULFILLED = "FULFILLED"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"

    __str__ = str.__str__


MandateStatusOrStr: TypeAlias = Annotated[MandateStatus | str, open_enum_validator(MandateStatus)]
