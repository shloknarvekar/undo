from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .event_chain import EventChain, EventChainDict
from .mandate_summary import MandateSummary, MandateSummaryDict
from .order import Order, OrderDict
from .undo_window_status import UndoWindowStatus, UndoWindowStatusDict


class OrderView(SdkBaseModel):
    """An order, its undo window, its mandate and its verified event chain."""

    order: Order
    """The purchase."""

    undo_window: UndoWindowStatus = Field(alias="undoWindow")
    """The undo window on an order: how long, why, and whether it is still open."""

    mandate: Optional[MandateSummary] = UNSET
    """The mandate this purchase was made under."""

    chain: EventChain
    """The mandate's event chain, with a proof on every step."""


class OrderViewDict(TypedDict):
    order: OrderDict
    undo_window: UndoWindowStatusDict
    mandate: NotRequired[MandateSummaryDict]
    chain: EventChainDict
