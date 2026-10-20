from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class ConfiguredIntegrations(SdkBaseModel):
    """Which integrations have credentials set. Never the values."""

    paypal: bool
    """PayPal sandbox client id and secret are set."""

    channel3: bool
    """The product catalog key is set."""

    database: bool
    """The Postgres connection string is set."""


class ConfiguredIntegrationsDict(TypedDict):
    paypal: bool
    channel3: bool
    database: bool
