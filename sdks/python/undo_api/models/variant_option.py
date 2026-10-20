from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class VariantOption(SdkBaseModel):
    """One option a product comes in, with its values."""

    name: str
    """Option name, for example Size."""

    values: list[str]
    """Available values, for example S, M, L."""


class VariantOptionDict(TypedDict):
    name: str
    values: list[str]
