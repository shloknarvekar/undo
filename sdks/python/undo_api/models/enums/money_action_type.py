from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class MoneyActionType(str, Enum):
    """What happens to the money."""

    VOID = "VOID"
    REFUND_FULL = "REFUND_FULL"
    OPEN_CLAIM = "OPEN_CLAIM"
    AUTHORIZE_RETURN = "AUTHORIZE_RETURN"
    REVIEW = "REVIEW"
    NONE = "NONE"

    __str__ = str.__str__


MoneyActionTypeOrStr: TypeAlias = Annotated[MoneyActionType | str, open_enum_validator(MoneyActionType)]
