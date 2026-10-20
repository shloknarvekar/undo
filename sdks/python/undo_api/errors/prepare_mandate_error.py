from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error
from ..models.not_ready import NotReady

PrepareMandateErrorBody: TypeAlias = Error | NotReady | RawError


@dataclass(frozen=True, slots=True)
class _PrepareMandateError:
    def map(self, status_code: int, content: bytes) -> PrepareMandateErrorBody:
        match status_code:
            case 400:
                return decode_json[Error](content)
            case 422:
                return decode_json[NotReady](content)
            case _:
                return RawError(status_code, content)


prepare_mandate_error_mapper: Final[ErrorMapper[PrepareMandateErrorBody]] = _PrepareMandateError()
