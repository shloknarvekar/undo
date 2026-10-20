from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, RFC3339DateTime, SdkBaseModel
from .cart import Cart, CartDict
from .enums.checkout_status import CheckoutStatusOrStr
from .enums.paid_with import PaidWithOrStr
from .trust import Trust, TrustDict
from .undo_window import UndoWindow, UndoWindowDict


class ShopResult(SdkBaseModel):
    """A checkout opened by Undo's agent inside a mandate."""

    order_id: UUID = Field(alias="orderId")
    """The new order. Read it with getOrder."""

    approve_url: OptionalNullable[str] = Field(default=UNSET, alias="approveUrl")
    """Where the shopper approves the payment in PayPal (absent when paid with a saved wallet)."""

    status: CheckoutStatusOrStr
    """Where a new checkout stands."""

    window_ends_at: OptionalNullable[RFC3339DateTime] = Field(default=UNSET, alias="windowEndsAt")
    """When the undo window closes, once the money is held."""

    paid_with: PaidWithOrStr = Field(alias="paidWith")
    """How a purchase was paid."""

    wallet_note: Optional[str] = Field(default=UNSET, alias="walletNote")
    """Why a saved wallet was not used, when the mandate allowed one."""

    cart: Cart
    """What the agent put in the cart."""

    agent: Any
    """The agent's reasoning, confidence and the guard's checks."""

    undo_window: UndoWindow = Field(alias="undoWindow")
    """How long the shopper can undo for free, and why."""

    trust: Trust
    """An agent's trust score at this store, with every point explained."""


class ShopResultDict(TypedDict):
    order_id: UUID
    approve_url: NotRequired[str | None]
    status: CheckoutStatusOrStr
    window_ends_at: NotRequired[RFC3339DateTime | None]
    paid_with: PaidWithOrStr
    wallet_note: NotRequired[str]
    cart: CartDict
    agent: Any
    undo_window: UndoWindowDict
    trust: TrustDict
