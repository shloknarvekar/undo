from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import RFC3339DateTime, SdkBaseModel


class ChainEventSummary(SdkBaseModel):
    """One event in a mandate's hash chain, without its payload."""

    seq: int
    """Position in the hash chain, starting at 1."""

    type_: str = Field(alias="type")
    """Event type, for example MANDATE_SIGNED or PAYMENT_VOIDED."""

    created_at: RFC3339DateTime = Field(alias="createdAt")
    """When it was created (ISO 8601, UTC)."""

    hash: str
    """SHA-256 of this event chained to the previous event's hash."""


class ChainEventSummaryDict(TypedDict):
    seq: int
    type_: str
    created_at: RFC3339DateTime
    hash: str
