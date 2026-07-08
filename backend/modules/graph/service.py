"""Business orchestration for graph browsing."""

from typing import Any

from common.errors import AppError
from models.graph import GraphEdge, GraphNode, NodeDetail, NodeType, Subgraph
from models.repository import GraphRepository


class GraphService:
    def __init__(self, repository: GraphRepository):
        self.repository = repository

    def list_nodes(self, node_type: NodeType | None, limit: int) -> list[GraphNode]:
        if node_type:
            return self.repository.get_nodes_by_type(node_type, limit)
        return self.repository.get_all_nodes(limit)

    def search_nodes(self, query: str, limit: int) -> list[GraphNode]:
        return self.repository.search_nodes(query, limit)

    def get_node_detail(self, node_id: str) -> NodeDetail:
        detail = self.repository.get_neighbors(node_id)
        if detail.node is None:
            raise AppError(
                code="GRAPH_NODE_NOT_FOUND",
                message="Graph node not found",
                status_code=404,
                details={"nodeId": node_id},
            )
        return detail

    def get_subgraph(self, node_ids: list[str], depth: int) -> Subgraph:
        return self.repository.get_subgraph(node_ids, depth)

    def list_edges(self, limit: int) -> list[GraphEdge]:
        return self.repository.get_all_edges(limit)

    def get_timeline(self, days: int, limit: int) -> list[GraphNode]:
        return self.repository.get_timeline(days, limit)

    def get_stats(self) -> dict[str, Any]:
        return self.repository.get_stats()

    async def trigger_sync(self, pipeline: Any | None) -> Any:
        if pipeline is None:
            raise AppError(
                code="GRAPH_PIPELINE_UNAVAILABLE",
                message="Pipeline not initialized",
                status_code=503,
            )
        return await pipeline.run()
