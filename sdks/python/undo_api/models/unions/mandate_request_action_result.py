from __future__ import annotations

from typing import TypeAlias

from ..draft_result import DraftResult, DraftResultDict
from ..prepared_mandate import PreparedMandate, PreparedMandateDict

MandateRequestActionResult: TypeAlias = DraftResult | PreparedMandate
"""The new draft after answer, or the mandate to sign after prepare."""

MandateRequestActionResultDict: TypeAlias = DraftResultDict | PreparedMandateDict
