from __future__ import annotations

from typing import Any

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .product import Product, ProductDict


class ProductDetail(SdkBaseModel):
    """A product at the requested variant, plus any option the catalog couldn't honor."""

    product: Product
    """A catalog product resolved to one offer and one exact variant."""

    relaxed: list[Any]
    """Requested options the catalog could not honor."""


class ProductDetailDict(TypedDict):
    product: ProductDict
    relaxed: list[Any]
