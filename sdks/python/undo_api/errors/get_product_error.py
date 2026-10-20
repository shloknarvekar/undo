from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error

GetProductErrorBody: TypeAlias = Error | RawError


@dataclass(frozen=True, slots=True)
class _GetProductError:
    def map(self, status_code: int, content: bytes) -> GetProductErrorBody:
        match status_code:
            case 404 | 502:
                return decode_json[Error](content)
            case _:
                return RawError(status_code, content)


get_product_error_mapper: Final[ErrorMapper[GetProductErrorBody]] = _GetProductError()
