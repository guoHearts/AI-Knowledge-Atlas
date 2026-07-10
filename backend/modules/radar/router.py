"""HTTP routes for AI Engineering Radar."""

from fastapi import APIRouter, Query

from common.errors import AppError
from common.i18n import DEFAULT_LOCALE
from common.response import error_response, success_response
from modules.radar.service import RadarService

router = APIRouter(prefix="/radar", tags=["radar"])


def get_service() -> RadarService:
    return RadarService()


@router.get("/items")
async def get_radar_items(category: str | None = Query(None), locale: str = Query(DEFAULT_LOCALE)):
    service = get_service()
    items = service.list_items(category=category, locale=locale)
    return success_response({"items": [item.model_dump() for item in items]})


@router.get("/items/{item_id}")
async def get_radar_item(item_id: str, locale: str = Query(DEFAULT_LOCALE)):
    service = get_service()
    try:
        item = service.get_item(item_id, locale=locale)
    except AppError as error:
        return error_response(error)
    return success_response(item.model_dump())


@router.get("/categories")
async def get_radar_categories(locale: str = Query(DEFAULT_LOCALE)):
    service = get_service()
    categories = service.list_categories(locale=locale)
    return success_response({"items": [category.model_dump() for category in categories]})


@router.get("/weekly/{week_number}")
async def get_weekly_radar(week_number: str, locale: str = Query(DEFAULT_LOCALE)):
    service = get_service()
    try:
        weekly_radar = service.get_weekly_radar(week_number, locale=locale)
    except AppError as error:
        return error_response(error)
    return success_response(weekly_radar.model_dump())
