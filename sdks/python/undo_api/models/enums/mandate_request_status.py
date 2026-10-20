from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class MandateRequestStatus(str, Enum):
    """Where a mandate request stands."""

    PENDING = "PENDING"
    SIGNED = "SIGNED"
    EXPIRED = "EXPIRED"

    __str__ = str.__str__


MandateRequestStatusOrStr: TypeAlias = Annotated[MandateRequestStatus | str, open_enum_validator(MandateRequestStatus)]
