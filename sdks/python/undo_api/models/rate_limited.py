from __future__ import annotations

from typing import Literal

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel


class RateLimited(SdkBaseModel):
    """Returned with 429 when this visitor made too many requests or a free-tier budget is spent."""

    error: Literal["rate_limited"] = "rate_limited"
    """The error code on a 429."""

    detail: str
    """What happened and how long to wait, in plain words."""

    retry_after: int = Field(alias="retryAfter")
    """Seconds to wait."""


class RateLimitedDict(TypedDict):
    error: Literal["rate_limited"]
    detail: str
    retry_after: int
