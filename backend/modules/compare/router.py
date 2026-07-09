"""HTTP routes for the Compare (技术选型) section."""

from fastapi import APIRouter, Query

from common.errors import AppError
from common.response import error_response, success_response
from modules.compare.service import CompareService

router = APIRouter(prefix="/compare", tags=["compare"])


def get_service() -> CompareService:
    return CompareService()


@router.get("/articles")
async def get_compare_articles(category: str | None = Query(None)):
    service = get_service()
    articles = service.list_articles(category=category)
    return success_response({"articles": [a.model_dump() for a in articles]})


@router.get("/articles/{article_id}")
async def get_compare_article(article_id: str):
    service = get_service()
    try:
        article = service.get_article(article_id)
    except AppError as error:
        return error_response(error)
    return success_response(article.model_dump())


@router.get("/categories")
async def get_compare_categories():
    service = get_service()
    categories = service.list_categories()
    return success_response({"items": [c.model_dump() for c in categories]})
