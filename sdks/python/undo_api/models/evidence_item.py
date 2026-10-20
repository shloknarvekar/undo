from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .enums.evidence_source import EvidenceSourceOrStr


class EvidenceItem(SdkBaseModel):
    """One finding behind a verdict and where it came from."""

    source: EvidenceSourceOrStr
    """Where a finding came from."""

    finding: str
    """The finding, in plain words."""


class EvidenceItemDict(TypedDict):
    source: EvidenceSourceOrStr
    finding: str
