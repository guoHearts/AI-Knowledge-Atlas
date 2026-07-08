"""Share API schemas."""

from pydantic import BaseModel, Field


class ShareRequest(BaseModel):
    node_ids: list[str] = Field(default_factory=list)
    node_types: list[str] = Field(default_factory=list)
    view_center: str | None = None
    zoom: float = 1.0


class ShareResponse(BaseModel):
    share_id: str
    url: str

