from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error

ResolveOrderErrorBody: TypeAlias = Error | RawError


@dataclass(frozen=True, slots=True)
class _ResolveOrderError:
    def map(self, status_code: int, content: bytes) -> ResolveOrderErrorBody:
        match status_code:
            case 400 | 403 | 404 | 409 | 502:
                return decode_json[Error](content)
            case _:
                return RawError(status_code, content)


resolve_order_error_mapper: Final[ErrorMapper[ResolveOrderErrorBody]] = _ResolveOrderError()
