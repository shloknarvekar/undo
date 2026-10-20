from __future__ import annotations

from typing import Any

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, SdkBaseModel
from .variant_option import VariantOption, VariantOptionDict


class Product(SdkBaseModel):
    """A catalog product resolved to one offer and one exact variant."""

    channel3_id: str = Field(alias="channel3Id")
    """Catalog product id. Use it with getProduct."""

    title: str
    """Product title."""

    brand: OptionalNullable[str] = UNSET
    """Brand name, when known."""

    description: OptionalNullable[str] = UNSET
    """Product description from the retailer, when there is one."""

    price: float
    """Price of the chosen offer, per item."""

    currency: str
    """ISO 4217 currency code."""

    image_url: OptionalNullable[str] = Field(default=UNSET, alias="imageUrl")
    """Product image URL, when there is one."""

    source_url: str = Field(alias="sourceUrl")
    """Where the product is sold."""

    source_domain: str = Field(alias="sourceDomain")
    """The retailer's domain."""

    colors: list[str]
    """Colors of the product as hex codes."""

    attributes: Any
    """Catalog attributes. Each value is a list of strings, for example activity: [Running]."""

    variant: dict[str, str]
    """The exact variant this offer resolves to, for example Size M and Color Black."""

    variant_options: list[VariantOption] = Field(alias="variantOptions")
    """Every option the product comes in, with its values."""


class ProductDict(TypedDict):
    channel3_id: str
    title: str
    brand: NotRequired[str | None]
    description: NotRequired[str | None]
    price: float
    currency: str
    image_url: NotRequired[str | None]
    source_url: str
    source_domain: str
    colors: list[str]
    attributes: Any
    variant: dict[str, str]
    variant_options: list[VariantOptionDict]
