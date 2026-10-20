from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .merchant_kpis import MerchantKpis, MerchantKpisDict
from .merchant_order import MerchantOrder, MerchantOrderDict


class MerchantOrders(SdkBaseModel):
    """The store's agent orders and headline numbers."""

    kpis: MerchantKpis
    """Headline numbers for the store."""

    orders: list[MerchantOrder]
    """Agent orders, newest first."""


class MerchantOrdersDict(TypedDict):
    kpis: MerchantKpisDict
    orders: list[MerchantOrderDict]
