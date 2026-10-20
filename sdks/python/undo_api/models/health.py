from __future__ import annotations

from typing import Any

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .configured_integrations import ConfiguredIntegrations, ConfiguredIntegrationsDict


class Health(SdkBaseModel):
    """Service health. Never includes secret values."""

    ok: bool
    """True when every check that ran passed."""

    service: str
    """Always undo."""

    commit: str
    """Deployed commit, or ``local``."""

    configured: ConfiguredIntegrations
    """Which integrations have credentials set. Never the values."""

    paypal: Optional[str] = UNSET
    """With ``deep``, ``reachable`` or the error."""

    database: Optional[Any] = UNSET
    """With deep: whether a live query worked, how long it took, and the shape of the connection URL (never
    credentials)."""

    usage: Optional[Any] = UNSET
    """With deep: free-tier budget used so far today and this month."""


class HealthDict(TypedDict):
    ok: bool
    service: str
    commit: str
    configured: ConfiguredIntegrationsDict
    paypal: NotRequired[str]
    database: NotRequired[Any]
    usage: NotRequired[Any]
