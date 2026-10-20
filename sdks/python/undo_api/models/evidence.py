from __future__ import annotations

from typing import Any, Literal
from uuid import UUID

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel


class Evidence(SdkBaseModel):
    """Everything needed to verify an order without trusting Undo."""

    format: Literal["undo-evidence-v1"] = "undo-evidence-v1"
    """Evidence file format."""

    order_id: UUID = Field(alias="orderId")
    """The order this evidence is for."""

    mandate: Any | None
    """The signed mandate exactly as stored."""

    events: list[Any]
    """Raw events exactly as hashed. Each hash covers the previous hash and the canonical payload."""


class EvidenceDict(TypedDict):
    format: Literal["undo-evidence-v1"]
    order_id: UUID
    mandate: Any | None
    events: list[Any]
