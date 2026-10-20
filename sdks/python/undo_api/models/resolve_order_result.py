from __future__ import annotations

from uuid import UUID

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel


class ResolveOrderResult(SdkBaseModel):
    """What the merchant's decision did."""

    order_id: UUID = Field(alias="orderId")
    """The order that was resolved."""


class ResolveOrderResultDict(TypedDict):
    order_id: UUID
