"""HTTP routes for knowledge graph browsing."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from common.errors import AppError
from common.response import error_response, success_response
from models.graph import NodeType
from models.repository import GraphRepository
from modules.graph.dependencies import get_graph_repository, get_pipeline
from modules.graph.service import GraphService

router = APIRouter(prefix="/graph", tags=["graph"])


def get_graph_service(
    repository: Annotated[GraphRepository, Depends(get_graph_repository)],
) -> GraphService:
    return GraphService(repository)


@router.get("/nodes")
async def list_nodes(
    service: Annotated[GraphService, Depends(get_graph_service)],
    node_type: NodeType | None = Query(None, description="Filter by node type"),
    limit: int = Query(100, ge=1, le=1000),
):
    nodes = service.list_nodes(node_type=node_type, limit=limit)
    return success_response({"items": [node.model_dump(mode="json") for node in nodes]})


@router.get("/nodes/search")
async def search_nodes(
    service: Annotated[GraphService, Depends(get_graph_service)],
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
):
    nodes = service.search_nodes(q, limit)
    return success_response({"items": [node.model_dump(mode="json") for node in nodes]})


@router.get("/nodes/{node_type}/{node_id}")
async def get_node_detail(
    node_type: str,
    node_id: str,
    service: Annotated[GraphService, Depends(get_graph_service)],
):
    try:
        detail = service.get_node_detail(node_id)
    except AppError as error:
        return error_response(error)
    return success_response(detail.model_dump(mode="json"))


@router.get("/subgraph")
async def get_subgraph(
    service: Annotated[GraphService, Depends(get_graph_service)],
    ids: list[str] = Query(..., description="Node IDs to include"),
    depth: int = Query(1, ge=1, le=3),
):
    subgraph = service.get_subgraph(ids, depth)
    return success_response(subgraph.model_dump(mode="json"))


@router.get("/edges")
async def list_edges(
    service: Annotated[GraphService, Depends(get_graph_service)],
    limit: int = Query(500, ge=1, le=5000),
):
    edges = service.list_edges(limit)
    return success_response({"items": [edge.model_dump(mode="json") for edge in edges]})


@router.get("/timeline")
async def get_timeline(
    service: Annotated[GraphService, Depends(get_graph_service)],
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(50, ge=1, le=200),
):
    nodes = service.get_timeline(days, limit)
    return success_response({"items": [node.model_dump(mode="json") for node in nodes]})


@router.get("/stats")
async def get_graph_stats(
    service: Annotated[GraphService, Depends(get_graph_service)],
):
    return success_response(service.get_stats())


@router.post("/admin/sync")
async def trigger_sync(
    service: Annotated[GraphService, Depends(get_graph_service)],
    pipeline: Annotated[object | None, Depends(get_pipeline)],
):
    try:
        stats = await service.trigger_sync(pipeline)
    except AppError as error:
        return error_response(error)
    return success_response(stats)
