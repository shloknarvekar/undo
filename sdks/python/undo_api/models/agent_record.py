from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, SdkBaseModel
from .rule_effect import RuleEffect, RuleEffectDict
from .trust import Trust, TrustDict


class AgentRecord(SdkBaseModel):
    """An agent's record at this store and what the rules do to it."""

    name: str
    """The agent operator's name."""

    verified: bool
    """Whether the agent presented a registered operator key."""

    via: OptionalNullable[str] = UNSET
    """How the agent connected: web or mcp."""

    purchases: Optional[int] = UNSET
    """Purchases made at this store."""

    faults: Optional[int] = UNSET
    """Undos where the agent was at fault."""

    trust: Trust
    """An agent's trust score at this store, with every point explained."""

    effect: RuleEffect
    """What the store's rules do to this agent's next purchase."""


class AgentRecordDict(TypedDict):
    name: str
    verified: bool
    via: NotRequired[str | None]
    purchases: NotRequired[int]
    faults: NotRequired[int]
    trust: TrustDict
    effect: RuleEffectDict
