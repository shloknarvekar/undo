from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class EvidenceSource(str, Enum):
    """Where a finding came from."""

    MANDATE_CHECK = "mandate_check"
    AGENT_RECORD = "agent_record"
    DELIVERED_PHOTO = "delivered_photo"
    AI_JUDGEMENT = "ai_judgement"
    SHOPPER = "shopper"

    __str__ = str.__str__


EvidenceSourceOrStr: TypeAlias = Annotated[EvidenceSource | str, open_enum_validator(EvidenceSource)]
