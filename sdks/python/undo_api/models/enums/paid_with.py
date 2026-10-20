from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class PaidWith(str, Enum):
    """How a purchase was paid."""

    APPROVAL = "approval"
    SAVED_WALLET = "saved_wallet"

    __str__ = str.__str__


PaidWithOrStr: TypeAlias = Annotated[PaidWith | str, open_enum_validator(PaidWith)]
