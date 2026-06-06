"""Share link generation — encode current graph view state into a short URL."""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import hashlib
import json

router = APIRouter(prefix="/share", tags=["share"])

# In-memory store (replace with DB table later if needed)
_share_store: dict[str, dict] = {}


class ShareRequest(BaseModel):
    node_ids: List[str] = []
    node_types: List[str] = []   # active filters
    view_center: Optional[str] = None  # focused node ID
    zoom: float = 1.0


class ShareResponse(BaseModel):
    share_id: str
    url: str


@router.post("/", response_model=ShareResponse)
async def create_share(req: ShareRequest, request: Request):
    """Create a share link encoding the current graph view state."""
    payload = req.model_dump()
    share_id = hashlib.md5(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:8]
    _share_store[share_id] = payload
    base_url = str(request.base_url).rstrip("/")
    return ShareResponse(
        share_id=share_id,
        url=f"{base_url}/s/{share_id}",
    )


@router.get("/{share_id}")
async def get_share(share_id: str):
    """Retrieve a shared view state."""
    if share_id not in _share_store:
        raise HTTPException(status_code=404, detail="Share link not found or expired")
    return _share_store[share_id]
