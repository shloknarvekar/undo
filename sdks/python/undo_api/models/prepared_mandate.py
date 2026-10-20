from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .intent_mandate import IntentMandate, IntentMandateDict


class PreparedMandate(SdkBaseModel):
    """The mandate to sign and the exact string to sign."""

    mandate: IntentMandate
    """What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing message."""

    signing_message: str = Field(alias="signingMessage")
    """Sign these exact UTF-8 bytes with the shopper's Ed25519 key."""


class PreparedMandateDict(TypedDict):
    mandate: IntentMandateDict
    signing_message: str
