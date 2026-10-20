from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class IntegrityCheck(SdkBaseModel):
    """A fresh check, run on every read."""

    digest_matches: bool = Field(alias="digestMatches")
    """The stored digest matches the mandate recomputed now."""

    signature_valid: bool = Field(alias="signatureValid")
    """The shopper's signature verifies against the mandate."""

    chain_intact: bool = Field(alias="chainIntact")
    """Every event's hash links correctly to the one before."""

    chain_broken_at: Optional[int] = Field(default=UNSET, alias="chainBrokenAt")
    """The first event whose hash doesn't link, when the chain is broken."""


class IntegrityCheckDict(TypedDict):
    digest_matches: bool
    signature_valid: bool
    chain_intact: bool
    chain_broken_at: NotRequired[int]
