from __future__ import annotations

from uuid import UUID

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .chain_event_ref import ChainEventRef, ChainEventRefDict


class StoredMandate(SdkBaseModel):
    """A stored mandate and the first event of its hash chain."""

    id: UUID
    """The stored mandate's id."""

    digest: str
    """SHA-256 (hex) of the mandate's canonical JSON."""

    event: ChainEventRef
    """The first event in the mandate's hash chain (MANDATE_SIGNED)."""


class StoredMandateDict(TypedDict):
    id: UUID
    digest: str
    event: ChainEventRefDict
