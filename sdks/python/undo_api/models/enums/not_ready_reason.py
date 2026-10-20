from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class NotReadyReason(str, Enum):
    """Why a draft can't be signed yet."""

    OPEN_QUESTIONS = "open_questions"
    MISSING_BUDGET = "missing_budget"

    __str__ = str.__str__


NotReadyReasonOrStr: TypeAlias = Annotated[NotReadyReason | str, open_enum_validator(NotReadyReason)]
