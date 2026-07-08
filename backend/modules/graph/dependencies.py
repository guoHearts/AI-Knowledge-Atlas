"""FastAPI dependencies for graph modules."""

from typing import Any

from fastapi import Request

from models.repository import GraphRepository


def get_graph_repository(request: Request) -> GraphRepository:
    return GraphRepository(request.app.state.neo4j_driver)


def get_pipeline(request: Request) -> Any | None:
    return getattr(request.app.state, "pipeline", None)
