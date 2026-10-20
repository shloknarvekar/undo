from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.gender import GenderOrStr


class IntentDraft(SdkBaseModel):
    """The shopper's limits in structured form."""

    item: str
    """What to buy, as a short noun phrase."""

    category: Optional[str] = UNSET
    """Product category in plain words."""

    quantity: int = 1
    """How many to buy."""

    max_price: float = Field(alias="maxPrice")
    """Ceiling per item; 0 means no budget was given."""

    currency: str = "USD"
    """Currency of maxPrice."""

    attributes: Optional[dict[str, str]] = UNSET
    """Required attribute values, keys lowercase."""

    gender: Optional[GenderOrStr] = UNSET
    """Men's or women's products."""

    brands: Optional[list[str]] = UNSET
    """Only these brands, if the shopper named any."""

    deadline: Optional[str] = UNSET
    """ISO date the item must arrive by."""

    notes: Optional[str] = UNSET
    """Soft preferences that are not hard limits."""

    must_ask: Optional[list[str]] = Field(default=UNSET, alias="mustAsk")
    """Questions to answer before the draft can be signed."""


class IntentDraftDict(TypedDict):
    item: str
    category: NotRequired[str]
    quantity: NotRequired[int]
    max_price: float
    currency: NotRequired[str]
    attributes: NotRequired[dict[str, str]]
    gender: NotRequired[GenderOrStr]
    brands: NotRequired[list[str]]
    deadline: NotRequired[str]
    notes: NotRequired[str]
    must_ask: NotRequired[list[str]]
