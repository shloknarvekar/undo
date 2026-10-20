from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Gender(str, Enum):
    """Men's or women's products."""

    MALE = "male"
    FEMALE = "female"

    __str__ = str.__str__


GenderOrStr: TypeAlias = Annotated[Gender | str, open_enum_validator(Gender)]
