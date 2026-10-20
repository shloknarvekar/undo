from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error
from ..models.rate_limited import RateLimited

UndoOrderErrorBody: TypeAlias = Error | RateLimited | RawError


@dataclass(frozen=True, slots=True)
class _UndoOrderError:
    def map(self, status_code: int, content: bytes) -> UndoOrderErrorBody:
        match status_code:
            case 400 | 403 | 404 | 409 | 413 | 422 | 502:
                return decode_json[Error](content)
            case 429:
                return decode_json[RateLimited](content)
            case _:
                return RawError(status_code, content)


undo_order_error_mapper: Final[ErrorMapper[UndoOrderErrorBody]] = _UndoOrderError()
