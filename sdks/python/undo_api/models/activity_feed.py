from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .activity_event import ActivityEvent, ActivityEventDict


class ActivityFeed(SdkBaseModel):
    """The store's latest activity."""

    events: list[ActivityEvent]
    """Events, newest first."""


class ActivityFeedDict(TypedDict):
    events: list[ActivityEventDict]
