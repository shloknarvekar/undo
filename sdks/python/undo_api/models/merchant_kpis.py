from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel


class MerchantKpis(SdkBaseModel):
    """Headline numbers for the store."""

    agent_orders: int = Field(alias="agentOrders")
    """Orders placed by agents (not counting abandoned checkouts)."""

    undone: int
    """Orders that were undone."""

    fees_avoided: float = Field(alias="feesAvoided")
    """Estimated PayPal fees avoided by voiding instead of refunding."""

    billed_to_agents: float = Field(alias="billedToAgents")
    """Money paid back to the store by agent operators through PayPal Payouts."""

    merchant_protected: int = Field(alias="merchantProtected")
    """Undos where the shopper changed their mind and the store was protected."""

    needs_action: int = Field(alias="needsAction")
    """Orders waiting for the store's decision."""

    held_now: float = Field(alias="heldNow")
    """Money held right now with an undo window open."""


class MerchantKpisDict(TypedDict):
    agent_orders: int
    undone: int
    fees_avoided: float
    billed_to_agents: float
    merchant_protected: int
    needs_action: int
    held_now: float
