from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, SdkBaseModel


class PayPalIds(SdkBaseModel):
    """The PayPal ids behind this order."""

    order_id: OptionalNullable[str] = Field(default=UNSET, alias="orderId")
    """PayPal Orders v2 id."""

    authorization_id: OptionalNullable[str] = Field(default=UNSET, alias="authorizationId")
    """PayPal authorization id, once the money is held."""

    capture_id: OptionalNullable[str] = Field(default=UNSET, alias="captureId")
    """PayPal capture id, once the money is taken."""


class PayPalIdsDict(TypedDict):
    order_id: NotRequired[str | None]
    authorization_id: NotRequired[str | None]
    capture_id: NotRequired[str | None]
