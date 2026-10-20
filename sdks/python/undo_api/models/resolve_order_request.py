from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .enums.resolve_action import ResolveActionOrStr


class ResolveOrderRequest(SdkBaseModel):
    """What the merchant decided."""

    action: ResolveActionOrStr
    """What the merchant decides about an order."""


class ResolveOrderRequestDict(TypedDict):
    action: ResolveActionOrStr
