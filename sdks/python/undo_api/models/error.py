from __future__ import annotations

from typing import Any

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class Error(SdkBaseModel):
    """An error. error is a stable machine-readable code; detail explains it."""

    error: str
    """Machine-readable code, for example ``not_found``, ``bad_signature``, ``purchase_already_open``."""

    detail: Optional[str] = UNSET
    """Human-readable detail, when there is one."""

    issues: Optional[list[Any]] = UNSET
    """Validation problems, on ``invalid_request``."""


class ErrorDict(TypedDict):
    error: str
    detail: NotRequired[str]
    issues: NotRequired[list[Any]]
