from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class SearchMode(str, Enum):
    """How the catalog reads the query."""

    DEFAULT = "default"
    AGENTIC = "agentic"

    __str__ = str.__str__


SearchModeOrStr: TypeAlias = Annotated[SearchMode | str, open_enum_validator(SearchMode)]
