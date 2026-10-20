from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class AgentRef(SdkBaseModel):
    """The agent a mandate authorizes. Inside the signed bytes, so liability follows the name."""

    name: str
    """The agent's name as it introduced itself."""

    verified: bool
    """The agent presented a registered operator key."""


class AgentRefDict(TypedDict):
    name: str
    verified: bool
