from __future__ import annotations

from uuid import UUID

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .decision import Decision, DecisionDict
from .undo_outcome import UndoOutcome, UndoOutcomeDict


class UndoResult(SdkBaseModel):
    """The verdict and what happened to the money."""

    order_id: UUID = Field(alias="orderId")
    """The order that was undone."""

    decision: Decision
    """The fault check's verdict, who pays, and the evidence behind it."""

    outcome: UndoOutcome
    """What happened to the money and the order's new status."""


class UndoResultDict(TypedDict):
    order_id: UUID
    decision: DecisionDict
    outcome: UndoOutcomeDict
