from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class ResolveAction(str, Enum):
    """What the merchant decides about an order."""

    ACCEPT_CLAIM = "accept_claim"
    RETURN_RECEIVED = "return_received"
    RETRY_SETTLEMENT = "retry_settlement"

    __str__ = str.__str__


ResolveActionOrStr: TypeAlias = Annotated[ResolveAction | str, open_enum_validator(ResolveAction)]
