"""Share-link service for graph view state."""

import hashlib
import json
from typing import Any

from common.errors import AppError
from modules.share.schemas import ShareRequest, ShareResponse


class ShareService:
    def __init__(self, store: dict[str, dict[str, Any]] | None = None):
        self._store = store if store is not None else {}

    def create_share(self, req: ShareRequest, base_url: str) -> ShareResponse:
        payload = req.model_dump()
        share_id = hashlib.md5(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:8]
        self._store[share_id] = payload
        return ShareResponse(
            share_id=share_id,
            url=f"{base_url.rstrip('/')}/s/{share_id}",
        )

    def get_share(self, share_id: str) -> dict[str, Any]:
        if share_id not in self._store:
            raise AppError(
                code="SHARE_NOT_FOUND",
                message="Share link not found or expired",
                status_code=404,
                details={"shareId": share_id},
            )
        return self._store[share_id]

