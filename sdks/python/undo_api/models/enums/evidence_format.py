from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class EvidenceFormat(str, Enum):
    """Evidence file format."""

    UNDO_EVIDENCE_V1 = "undo-evidence-v1"

    __str__ = str.__str__


EvidenceFormatOrStr: TypeAlias = Annotated[EvidenceFormat | str, open_enum_validator(EvidenceFormat)]
