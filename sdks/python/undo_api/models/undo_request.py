from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, RFC3339DateTime, SdkBaseModel


class UndoRequest(SdkBaseModel):
    """An Undo, signed by the shopper's device key."""

    reason: str
    """What went wrong, in the shopper's words."""

    photo: Optional[str] = UNSET
    """Optional photo of what arrived, as a base64 JPEG, PNG or WebP data URL (max 4 MB)."""

    requested_at: RFC3339DateTime = Field(alias="requestedAt")
    """When the shopper pressed Undo. Must be within 15 minutes of the server's clock."""

    signature: str
    """Base64 Ed25519 signature of the undo signing message."""


class UndoRequestDict(TypedDict):
    reason: str
    photo: NotRequired[str]
    requested_at: RFC3339DateTime
    signature: str
