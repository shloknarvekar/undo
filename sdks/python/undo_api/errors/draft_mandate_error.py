from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error
from ..models.rate_limited import RateLimited

DraftMandateErrorBody: TypeAlias = Error | RateLimited | RawError


@dataclass(frozen=True, slots=True)
class _DraftMandateError:
    def map(self, status_code: int, content: bytes) -> DraftMandateErrorBody:
        match status_code:
            case 400 | 502 | 503:
                return decode_json[Error](content)
            case 429:
                return decode_json[RateLimited](content)
            case _:
                return RawError(status_code, content)


draft_mandate_error_mapper: Final[ErrorMapper[DraftMandateErrorBody]] = _DraftMandateError()
