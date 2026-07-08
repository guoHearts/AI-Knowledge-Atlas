"""HTTP routes for share links."""

from typing import Any

from fastapi import APIRouter, Request

from common.errors import AppError
from common.response import error_response, success_response
from modules.share.schemas import ShareRequest
from modules.share.service import ShareService

router = APIRouter(prefix="/share", tags=["share"])

_share_store: dict[str, dict[str, Any]] = {}


def get_service() -> ShareService:
    return ShareService(_share_store)


@router.post("/")
async def create_share(req: ShareRequest, request: Request):
    base_url = str(request.base_url).rstrip("/")
    try:
        return success_response(get_service().create_share(req, base_url))
    except AppError as error:
        return error_response(error)


@router.get("/{share_id}")
async def get_share(share_id: str):
    try:
        return success_response(get_service().get_share(share_id))
    except AppError as error:
        return error_response(error)

