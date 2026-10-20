from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .agent_record import AgentRecord, AgentRecordDict
from .merchant_rules import MerchantRules, MerchantRulesDict


class MerchantAgents(SdkBaseModel):
    """Every agent that has shopped here and the store's rules."""

    rules: MerchantRules
    """The store's rules for agents. They apply from the next checkout."""

    agents: list[AgentRecord]
    """Every agent that has shopped here, riskiest first."""


class MerchantAgentsDict(TypedDict):
    rules: MerchantRulesDict
    agents: list[AgentRecordDict]
