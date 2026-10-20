from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error

StoreMandateErrorBody: TypeAlias = Error | RawError


@dataclass(frozen=True, slots=True)
class _StoreMandateError:
    def map(self, status_code: int, content: bytes) -> StoreMandateErrorBody:
        match status_code:
            case 400 | 403 | 409 | 422:
                return decode_json[Error](content)
            case _:
                return RawError(status_code, content)


store_mandate_error_mapper: Final[ErrorMapper[StoreMandateErrorBody]] = _StoreMandateError()
