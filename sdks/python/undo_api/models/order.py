from __future__ import annotations

from typing import Any
from uuid import UUID

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, SdkBaseModel
from .enums.order_status import OrderStatusOrStr
from .pay_pal_ids import PayPalIds, PayPalIdsDict
from .product import Product, ProductDict


class Order(SdkBaseModel):
    """The purchase."""

    id: UUID
    """Undo order id."""

    status: OrderStatusOrStr
    """Where an order stands. AUTHORIZED means the money is only held and Undo is a free void."""

    amount: str
    """Total held or charged, as a decimal string."""

    currency: str
    """ISO 4217 currency code."""

    quantity: int
    """Number of items."""

    product: Product
    """A catalog product resolved to one offer and one exact variant."""

    agent: Optional[Any] = UNSET
    """The agent's reasoning, confidence, guard checks and operator, as recorded at checkout."""

    paypal: PayPalIds
    """The PayPal ids behind this order."""

    resolution: OptionalNullable[Any] = UNSET
    """The latest Undo, with verdict, evidence, money action and any agent payout."""


class OrderDict(TypedDict):
    id: UUID
    status: OrderStatusOrStr
    amount: str
    currency: str
    quantity: int
    product: ProductDict
    agent: NotRequired[Any]
    paypal: PayPalIdsDict
    resolution: NotRequired[Any | None]
