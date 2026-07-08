"""HTTP routes for content helpers."""

from fastapi import APIRouter

from modules.content.service import ContentService

router = APIRouter(prefix="/content", tags=["content"])


def get_service() -> ContentService:
    return ContentService()


@router.get("/design-patterns")
async def list_design_patterns():
    return get_service().list_design_patterns()


@router.get("/graph-node-lessons/{node_id}")
async def get_lessons_for_graph_node(node_id: str):
    return get_service().get_lessons_for_graph_node(node_id)

