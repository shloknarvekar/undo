from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class CheckoutStatus(str, Enum):
    """Where a new checkout stands."""

    CHECKOUT_CREATED = "CHECKOUT_CREATED"
    AUTHORIZED = "AUTHORIZED"

    __str__ = str.__str__


CheckoutStatusOrStr: TypeAlias = Annotated[CheckoutStatus | str, open_enum_validator(CheckoutStatus)]
