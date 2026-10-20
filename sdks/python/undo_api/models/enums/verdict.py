from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Verdict(str, Enum):
    """Who was at fault."""

    AGENT_FAULT = "AGENT_FAULT"
    MERCHANT_FAULT = "MERCHANT_FAULT"
    SHOPPER_CHANGED_MIND = "SHOPPER_CHANGED_MIND"
    INCONCLUSIVE = "INCONCLUSIVE"

    __str__ = str.__str__


VerdictOrStr: TypeAlias = Annotated[Verdict | str, open_enum_validator(Verdict)]
