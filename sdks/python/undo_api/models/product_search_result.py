from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, SdkBaseModel
from .product import Product, ProductDict


class ProductSearchResult(SdkBaseModel):
    """Search results."""

    category: OptionalNullable[str] = UNSET
    """The catalog category the search was narrowed to."""

    products: list[Product]
    """Products that have at least one offer."""


class ProductSearchResultDict(TypedDict):
    category: NotRequired[str | None]
    products: list[ProductDict]
