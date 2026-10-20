from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class AnswerActionName(str, Enum):
    """Always answer."""

    ANSWER = "answer"

    __str__ = str.__str__


AnswerActionNameOrStr: TypeAlias = Annotated[AnswerActionName | str, open_enum_validator(AnswerActionName)]
