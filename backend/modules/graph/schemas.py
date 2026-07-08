"""Response data wrappers for graph API endpoints."""

from pydantic import BaseModel

from models.graph import GraphEdge, GraphNode


class GraphNodesData(BaseModel):
    items: list[GraphNode]


class GraphEdgesData(BaseModel):
    items: list[GraphEdge]


class TimelineData(BaseModel):
    items: list[GraphNode]
