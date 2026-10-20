from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .intent_mandate import IntentMandate, IntentMandateDict


class SignedMandate(SdkBaseModel):
    """A mandate and the shopper's signature over its signing message."""

    mandate: IntentMandate
    """What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing message."""

    signature: str
    """Base64 Ed25519 signature of the signing message."""


class SignedMandateDict(TypedDict):
    mandate: IntentMandateDict
    signature: str
