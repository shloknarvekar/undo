from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class PayWith(str, Enum):
    """How the agent may pay."""

    SAVED_WALLET = "saved_wallet"

    __str__ = str.__str__


PayWithOrStr: TypeAlias = Annotated[PayWith | str, open_enum_validator(PayWith)]
