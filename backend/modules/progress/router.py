"""HTTP routes for learning progress."""

from fastapi import APIRouter

from common.errors import AppError
from common.response import error_response, success_response
from modules.progress.schemas import ProgressUpdate
from modules.progress.service import ProgressService

router = APIRouter(prefix="/progress", tags=["progress"])


def get_service() -> ProgressService:
    return ProgressService()


@router.get("/{user_id}")
async def get_user_progress(user_id: str = "default"):
    try:
        return success_response(get_service().get_user_progress(user_id))
    except AppError as error:
        return error_response(error)


@router.put("/{user_id}/lesson/{lesson_id}")
async def update_lesson_progress(user_id: str, lesson_id: str, update: ProgressUpdate):
    try:
        return success_response(get_service().update_lesson_progress(user_id, lesson_id, update))
    except AppError as error:
        return error_response(error)


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str = "default"):
    try:
        return success_response(get_service().get_user_stats(user_id))
    except AppError as error:
        return error_response(error)

