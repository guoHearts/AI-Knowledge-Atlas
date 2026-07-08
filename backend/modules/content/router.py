"""HTTP routes for content helpers."""

from fastapi import APIRouter

from common.errors import AppError
from common.response import error_response, success_response
from modules.content.service import ContentService

router = APIRouter(prefix="/content", tags=["content"])


def get_service() -> ContentService:
    return ContentService()


@router.get("/design-patterns")
async def list_design_patterns():
    try:
        return success_response(get_service().list_design_patterns())
    except AppError as error:
        return error_response(error)


@router.get("/graph-node-lessons/{node_id}")
async def get_lessons_for_graph_node(node_id: str):
    try:
        return success_response(get_service().get_lessons_for_graph_node(node_id))
    except AppError as error:
        return error_response(error)

