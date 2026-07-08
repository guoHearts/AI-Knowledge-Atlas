"""HTTP routes for share links."""

from typing import Any

from fastapi import APIRouter, HTTPException, Request

from common.errors import AppError
from modules.share.schemas import ShareRequest, ShareResponse
from modules.share.service import ShareService

router = APIRouter(prefix="/share", tags=["share"])

_share_store: dict[str, dict[str, Any]] = {}


def get_service() -> ShareService:
    return ShareService(_share_store)


@router.post("/", response_model=ShareResponse)
async def create_share(req: ShareRequest, request: Request):
    base_url = str(request.base_url).rstrip("/")
    return get_service().create_share(req, base_url)


@router.get("/{share_id}")
async def get_share(share_id: str):
    try:
        return get_service().get_share(share_id)
    except AppError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message) from error

