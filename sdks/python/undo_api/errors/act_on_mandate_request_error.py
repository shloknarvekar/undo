from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error
from ..models.rate_limited import RateLimited

ActOnMandateRequestErrorBody: TypeAlias = Error | RateLimited | RawError


@dataclass(frozen=True, slots=True)
class _ActOnMandateRequestError:
    def map(self, status_code: int, content: bytes) -> ActOnMandateRequestErrorBody:
        match status_code:
            case 400 | 404 | 409 | 422:
                return decode_json[Error](content)
            case 429:
                return decode_json[RateLimited](content)
            case _:
                return RawError(status_code, content)


act_on_mandate_request_error_mapper: Final[ErrorMapper[ActOnMandateRequestErrorBody]] = _ActOnMandateRequestError()
