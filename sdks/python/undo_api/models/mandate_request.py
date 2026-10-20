from __future__ import annotations

from uuid import UUID

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, RFC3339DateTime, SdkBaseModel
from .agent_ref import AgentRef, AgentRefDict
from .enums.mandate_request_status import MandateRequestStatusOrStr
from .intent_draft import IntentDraft, IntentDraftDict
from .ready_check import ReadyCheck, ReadyCheckDict


class MandateRequest(SdkBaseModel):
    """A mandate an outside agent asked the shopper to sign."""

    id: UUID
    """Mandate request id."""

    request: str
    """The request as the agent passed it on, plus any answers."""

    draft: IntentDraft
    """The shopper's limits in structured form."""

    ready: ReadyCheck
    """Whether a draft can be signed as is."""

    agent: AgentRef
    """The agent a mandate authorizes. Inside the signed bytes, so liability follows the name."""

    status: MandateRequestStatusOrStr
    """Where a mandate request stands."""

    mandate_id: OptionalNullable[UUID] = Field(default=UNSET, alias="mandateId")
    """The signed mandate, once there is one."""

    expires_at: RFC3339DateTime = Field(alias="expiresAt")
    """When the request stops accepting a signature."""


class MandateRequestDict(TypedDict):
    id: UUID
    request: str
    draft: IntentDraftDict
    ready: ReadyCheckDict
    agent: AgentRefDict
    status: MandateRequestStatusOrStr
    mandate_id: NotRequired[UUID | None]
    expires_at: RFC3339DateTime
