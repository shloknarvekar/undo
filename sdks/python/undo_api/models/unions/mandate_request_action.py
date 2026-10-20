from __future__ import annotations

from typing import Annotated, TypeAlias

from pydantic import Tag

from ...core import WireDiscriminator
from ..answer_action import AnswerAction, AnswerActionDict
from ..prepare_action import PrepareAction, PrepareActionDict
from ..sign_action import SignAction, SignActionDict

MandateRequestAction: TypeAlias = Annotated[
    (
        Annotated[AnswerAction, Tag("answer")]
        | Annotated[PrepareAction, Tag("prepare")]
        | Annotated[SignAction, Tag("sign")]
    ),
    WireDiscriminator("action"),
]
"""One of answer, prepare or sign, chosen by action."""

MandateRequestActionDict: TypeAlias = AnswerActionDict | PrepareActionDict | SignActionDict
