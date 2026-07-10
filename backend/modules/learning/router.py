"""HTTP routes for learning content owned by the backend."""

from fastapi import APIRouter, Depends, Query

from common.errors import AppError
from common.i18n import DEFAULT_LOCALE
from common.response import error_response, success_response
from modules.learning.schemas import ProgressUpsertRequest
from modules.learning.service import LearningService
from modules.learning.dependencies import get_learning_service

router = APIRouter(prefix="/learning", tags=["learning"])


@router.get("/tracks")
async def list_tracks(service: LearningService = Depends(get_learning_service)):
    return success_response(service.list_tracks())


@router.get("/tracks/{slug}")
async def get_track(slug: str, service: LearningService = Depends(get_learning_service)):
    try:
        return success_response(service.get_track(slug))
    except AppError as error:
        return error_response(error)


@router.get("/modules/{module_id}")
async def get_module(module_id: str, service: LearningService = Depends(get_learning_service)):
    try:
        return success_response(service.get_module(module_id))
    except AppError as error:
        return error_response(error)


@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str, service: LearningService = Depends(get_learning_service)):
    try:
        return success_response(service.get_lesson(lesson_id))
    except AppError as error:
        return error_response(error)


@router.get("/design-patterns")
async def list_design_patterns(service: LearningService = Depends(get_learning_service)):
    return success_response(service.list_design_patterns())


@router.get("/design-patterns/{pattern_id}")
async def get_design_pattern(pattern_id: str, service: LearningService = Depends(get_learning_service)):
    try:
        return success_response(service.get_design_pattern(pattern_id))
    except AppError as error:
        return error_response(error)


@router.get("/progress")
async def list_progress(
    user_id: str = Query("default", alias="userId"),
    service: LearningService = Depends(get_learning_service),
):
    return success_response(service.list_progress(user_id))


@router.put("/progress")
async def upsert_progress(
    payload: ProgressUpsertRequest,
    service: LearningService = Depends(get_learning_service),
):
    try:
        return success_response(service.upsert_progress(payload.to_repository_payload()))
    except ValueError as error:
        return error_response(AppError("VALIDATION_ERROR", str(error), status_code=422))


@router.get("/home/stats")
async def get_home_stats(
    user_id: str = Query("default", alias="userId"),
    service: LearningService = Depends(get_learning_service),
):
    return success_response(service.get_home_stats(user_id))


@router.get("/home/content")
async def get_home_content(service: LearningService = Depends(get_learning_service)):
    return success_response(service.get_home_content())


@router.get("/metadata")
async def get_metadata(service: LearningService = Depends(get_learning_service)):
    return success_response(service.get_metadata())


@router.get("/labs")
async def list_labs(
    locale: str = Query(DEFAULT_LOCALE),
    service: LearningService = Depends(get_learning_service),
):
    return success_response(service.list_labs(locale=locale))


@router.get("/labs/{lab_id}")
async def get_lab(
    lab_id: str,
    locale: str = Query(DEFAULT_LOCALE),
    service: LearningService = Depends(get_learning_service),
):
    try:
        return success_response(service.get_lab(lab_id, locale=locale))
    except AppError as error:
        return error_response(error)


@router.get("/cms/dashboard")
async def get_cms_dashboard(service: LearningService = Depends(get_learning_service)):
    return success_response(service.get_cms_dashboard())
