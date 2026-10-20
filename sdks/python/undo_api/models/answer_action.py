from __future__ import annotations

from typing import Literal

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class AnswerAction(SdkBaseModel):
    """Answer the agent's open questions."""

    action: Literal["answer"] = "answer"
    """Always answer."""

    answers: dict[str, str]
    """Each open question (exactly as asked) mapped to the shopper's answer."""


class AnswerActionDict(TypedDict):
    action: Literal["answer"]
    answers: dict[str, str]
