from __future__ import annotations

from uuid import UUID

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel


class MandateRequestSigned(SdkBaseModel):
    """A mandate request that was signed and stored."""

    mandate_id: UUID = Field(alias="mandateId")
    """The stored mandate's id."""

    digest: str
    """SHA-256 of the canonical mandate."""


class MandateRequestSignedDict(TypedDict):
    mandate_id: UUID
    digest: str
