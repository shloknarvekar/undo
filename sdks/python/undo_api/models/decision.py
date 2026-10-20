from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .enums.liability import LiabilityOrStr
from .enums.verdict import VerdictOrStr
from .evidence_item import EvidenceItem, EvidenceItemDict


class Decision(SdkBaseModel):
    """The fault check's verdict, who pays, and the evidence behind it."""

    verdict: VerdictOrStr
    """Who was at fault."""

    confidence: float
    """How sure the fault check is, from 0 to 1. Below 0.7 goes to a person."""

    liability: LiabilityOrStr | None
    """Who pays. Null when a person still has to decide."""

    evidence: list[EvidenceItem]
    """Each finding behind the verdict and where it came from."""


class DecisionDict(TypedDict):
    verdict: VerdictOrStr
    confidence: float
    liability: LiabilityOrStr | None
    evidence: list[EvidenceItemDict]
