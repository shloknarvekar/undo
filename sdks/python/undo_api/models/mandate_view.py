from __future__ import annotations

from typing import Any

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .chain_event_summary import ChainEventSummary, ChainEventSummaryDict
from .enums.mandate_status import MandateStatusOrStr
from .integrity_check import IntegrityCheck, IntegrityCheckDict
from .intent_mandate import IntentMandate, IntentMandateDict


class MandateView(SdkBaseModel):
    """A mandate with its status, the search it permits, and a fresh integrity check."""

    mandate: IntentMandate
    """What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing message."""

    status: MandateStatusOrStr
    """Where a mandate stands."""

    search: Any
    """The product search this mandate permits."""

    integrity: IntegrityCheck
    """A fresh check, run on every read."""

    events: list[ChainEventSummary]
    """The mandate's event chain, oldest first."""


class MandateViewDict(TypedDict):
    mandate: IntentMandateDict
    status: MandateStatusOrStr
    search: Any
    integrity: IntegrityCheckDict
    events: list[ChainEventSummaryDict]
