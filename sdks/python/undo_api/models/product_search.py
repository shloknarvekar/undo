from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.gender import GenderOrStr
from .enums.search_mode import SearchModeOrStr


class ProductSearch(SdkBaseModel):
    """A catalog search with structured filters."""

    query: str
    """What to search for, in plain words."""

    max_price: Optional[float] = Field(default=UNSET, alias="maxPrice")
    """Highest price per item."""

    min_price: Optional[float] = Field(default=UNSET, alias="minPrice")
    """Lowest price per item."""

    color: Optional[str] = UNSET
    """Color name, for example black."""

    category: Optional[str] = UNSET
    """Plain-words category, resolved server-side."""

    gender: Optional[GenderOrStr] = UNSET
    """Men's or women's products."""

    limit: Optional[int] = UNSET
    """How many products to return."""

    mode: Optional[SearchModeOrStr] = UNSET
    """How the catalog reads the query."""


class ProductSearchDict(TypedDict):
    query: str
    max_price: NotRequired[float]
    min_price: NotRequired[float]
    color: NotRequired[str]
    category: NotRequired[str]
    gender: NotRequired[GenderOrStr]
    limit: NotRequired[int]
    mode: NotRequired[SearchModeOrStr]
