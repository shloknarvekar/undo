from __future__ import annotations

from typing import Literal

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .intent_mandate import IntentMandate, IntentMandateDict


class SignAction(SdkBaseModel):
    """Store the signed mandate."""

    action: Literal["sign"] = "sign"
    """Always sign."""

    mandate: IntentMandate
    """What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing message."""

    signature: str
    """Base64 Ed25519 signature of the signingMessage returned by prepare."""


class SignActionDict(TypedDict):
    action: Literal["sign"]
    mandate: IntentMandateDict
    signature: str
