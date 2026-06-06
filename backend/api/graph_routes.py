"""Graph browsing and exploration API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from models.graph import GraphNode, GraphEdge, NodeType, NodeDetail, Subgraph
from models.repository import GraphRepository
from typing import List, Optional

router = APIRouter(prefix="/graph", tags=["graph"])


def get_repo() -> GraphRepository:
    """Dependency injection — get repository from app state."""
    from main import app
    return GraphRepository(app.state.neo4j_driver)


@router.get("/nodes", response_model=List[GraphNode])
async def list_nodes(
    node_type: Optional[NodeType] = Query(None, description="Filter by node type"),
    limit: int = Query(100, ge=1, le=1000),
    repo: GraphRepository = Depends(get_repo),
):
    """List all nodes, optionally filtered by type."""
    if node_type:
        return repo.get_nodes_by_type(node_type, limit)
    return repo.get_all_nodes(limit)


@router.get("/nodes/search", response_model=List[GraphNode])
async def search_nodes(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    repo: GraphRepository = Depends(get_repo),
):
    """Fulltext search across all node types."""
    return repo.search_nodes(q, limit)


@router.get("/nodes/{node_type}/{node_id}", response_model=NodeDetail)
async def get_node_detail(
    node_type: str,
    node_id: str,
    repo: GraphRepository = Depends(get_repo),
):
    """Get a node with its neighbors and relationships."""
    detail = repo.get_neighbors(node_id)
    if detail.node is None:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found")
    return detail


@router.get("/subgraph", response_model=Subgraph)
async def get_subgraph(
    ids: List[str] = Query(..., description="Node IDs to include"),
    depth: int = Query(1, ge=1, le=3),
    repo: GraphRepository = Depends(get_repo),
):
    """Get a subgraph for the given node IDs with N-degree expansion."""
    return repo.get_subgraph(ids, depth)


@router.get("/edges", response_model=List[GraphEdge])
async def list_edges(
    limit: int = Query(500, ge=1, le=5000),
    repo: GraphRepository = Depends(get_repo),
):
    """List all relationships."""
    return repo.get_all_edges(limit)


@router.get("/timeline", response_model=List[GraphNode])
async def get_timeline(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(50, ge=1, le=200),
    repo: GraphRepository = Depends(get_repo),
):
    """Get nodes first seen in the last N days."""
    return repo.get_timeline(days, limit)


@router.post("/admin/sync")
async def trigger_sync(repo: GraphRepository = Depends(get_repo)):
    """Manually trigger a data pipeline run. Returns stats."""
    from main import app
    if not hasattr(app.state, 'pipeline'):
        raise HTTPException(status_code=503, detail="Pipeline not initialized")
    stats = await app.state.pipeline.run()
    return stats
