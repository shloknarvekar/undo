from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, SdkBaseModel


class Cart(SdkBaseModel):
    """What the agent put in the cart."""

    title: str
    """Product title."""

    brand: OptionalNullable[str] = UNSET
    """Brand name, when known."""

    variant: dict[str, str]
    """The exact variant bought."""

    price: float
    """Price per item in currency units."""

    currency: str
    """ISO 4217 currency code."""

    quantity: int
    """Number of items."""

    retailer: Optional[str] = UNSET
    """The retailer's domain."""

    image_url: OptionalNullable[str] = Field(default=UNSET, alias="imageUrl")
    """Product image URL, when there is one."""


class CartDict(TypedDict):
    title: str
    brand: NotRequired[str | None]
    variant: dict[str, str]
    price: float
    currency: str
    quantity: int
    retailer: NotRequired[str]
    image_url: NotRequired[str | None]
