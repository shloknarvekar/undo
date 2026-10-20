from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class ChainEventRef(SdkBaseModel):
    """The first event in the mandate's hash chain (MANDATE_SIGNED)."""

    seq: int
    """Position in the hash chain, starting at 1."""

    hash: str
    """SHA-256 of this event chained to the previous event's hash."""


class ChainEventRefDict(TypedDict):
    seq: int
    hash: str
