from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.health import Health

GetHealthErrorBody: TypeAlias = Health | RawError


@dataclass(frozen=True, slots=True)
class _GetHealthError:
    def map(self, status_code: int, content: bytes) -> GetHealthErrorBody:
        match status_code:
            case 503:
                return decode_json[Health](content)
            case _:
                return RawError(status_code, content)


get_health_error_mapper: Final[ErrorMapper[GetHealthErrorBody]] = _GetHealthError()
