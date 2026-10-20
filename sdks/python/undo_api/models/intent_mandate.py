from __future__ import annotations

from uuid import UUID

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, RFC3339DateTime, SdkBaseModel
from .agent_ref import AgentRef, AgentRefDict
from .enums.pay_with import PayWithOrStr
from .intent_draft import IntentDraft, IntentDraftDict


class IntentMandate(SdkBaseModel):
    """What the shopper signs. Its canonical JSON (sorted keys) is hashed with SHA-256 for the signing message."""

    version: int
    """Mandate format version. Always 1."""

    id: UUID
    """Mandate id, chosen when it was prepared."""

    created_at: RFC3339DateTime = Field(alias="createdAt")
    """When the mandate was prepared."""

    expires_at: RFC3339DateTime = Field(alias="expiresAt")
    """When the mandate stops working (14 days after it was prepared)."""

    shopper_key: str = Field(alias="shopperKey")
    """Base64 Ed25519 public key (32 bytes)."""

    request: str
    """The shopper's own words, verbatim."""

    intent: IntentDraft
    """The shopper's limits in structured form."""

    agent: Optional[AgentRef] = UNSET
    """The agent a mandate authorizes. Inside the signed bytes, so liability follows the name."""

    pay_with: Optional[PayWithOrStr] = Field(default=UNSET, alias="payWith")
    """How the agent may pay."""


class IntentMandateDict(TypedDict):
    version: int
    id: UUID
    created_at: RFC3339DateTime
    expires_at: RFC3339DateTime
    shopper_key: str
    request: str
    intent: IntentDraftDict
    agent: NotRequired[AgentRefDict]
    pay_with: NotRequired[PayWithOrStr]
