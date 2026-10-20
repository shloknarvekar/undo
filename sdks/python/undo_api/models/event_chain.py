from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .chain_event import ChainEvent, ChainEventDict


class EventChain(SdkBaseModel):
    """The mandate's event chain, with a proof on every step."""

    intact: bool
    """Every hash links correctly."""

    events: list[ChainEvent]
    """Events, oldest first."""


class EventChainDict(TypedDict):
    intact: bool
    events: list[ChainEventDict]
