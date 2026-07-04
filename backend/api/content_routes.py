"""Course content API endpoints — proxy SQLite data from Next.js side.

These endpoints are minimal; the primary content API lives in Next.js Route Handlers.
This backend module exists for future cases where content operations need Neo4j access.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/design-patterns")
async def list_design_patterns():
    """Return design patterns accessible from knowledge graph context."""
    patterns = [
        {"id": "pipeline", "name": "pipeline", "title": "Pipeline 模式", "category": "orchestration"},
        {"id": "router", "name": "router", "title": "Router 模式", "category": "orchestration"},
        {"id": "orchestrator-worker", "name": "orchestrator-worker", "title": "Orchestrator-Worker 模式", "category": "collaboration"},
        {"id": "fan-out-fan-in", "name": "fan-out-fan-in", "title": "Fan-out/Fan-in 模式", "category": "collaboration"},
        {"id": "human-in-the-loop", "name": "human-in-the-loop", "title": "Human-in-the-loop 模式", "category": "quality"},
        {"id": "self-healing", "name": "self-healing", "title": "Self-healing 模式", "category": "quality"},
        {"id": "verifier-generator", "name": "verifier-generator", "title": "Verifier-Generator 模式", "category": "quality"},
    ]
    return patterns


@router.get("/graph-node-lessons/{node_id}")
async def get_lessons_for_graph_node(node_id: str):
    """Find lessons associated with a graph node. Used by graph→course linking."""
    # In production, this queries SQLite for lessons where graph_node_ids contains node_id
    # For now, return empty — the linking data seeds from seed.ts
    return {"node_id": node_id, "lessons": []}
