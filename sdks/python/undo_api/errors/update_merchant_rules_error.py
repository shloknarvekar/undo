from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error
from ..models.rate_limited import RateLimited

UpdateMerchantRulesErrorBody: TypeAlias = Error | RateLimited | RawError


@dataclass(frozen=True, slots=True)
class _UpdateMerchantRulesError:
    def map(self, status_code: int, content: bytes) -> UpdateMerchantRulesErrorBody:
        match status_code:
            case 400:
                return decode_json[Error](content)
            case 429:
                return decode_json[RateLimited](content)
            case _:
                return RawError(status_code, content)


update_merchant_rules_error_mapper: Final[ErrorMapper[UpdateMerchantRulesErrorBody]] = _UpdateMerchantRulesError()
