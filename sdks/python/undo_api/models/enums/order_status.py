from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class OrderStatus(str, Enum):
    """Where an order stands. AUTHORIZED means the money is only held and Undo is a free void."""

    CHECKOUT_CREATED = "CHECKOUT_CREATED"
    CANCELLED = "CANCELLED"
    AUTHORIZED = "AUTHORIZED"
    VOIDED = "VOIDED"
    CAPTURED = "CAPTURED"
    REFUNDED = "REFUNDED"
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
    CLAIM_OPEN = "CLAIM_OPEN"
    RETURN_PENDING = "RETURN_PENDING"
    REVIEW = "REVIEW"
    DISPUTED = "DISPUTED"
    FAILED = "FAILED"

    __str__ = str.__str__


OrderStatusOrStr: TypeAlias = Annotated[OrderStatus | str, open_enum_validator(OrderStatus)]
