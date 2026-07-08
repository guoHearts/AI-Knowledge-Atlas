import asyncio

import pytest

from common.errors import AppError
from models.graph import NodeDetail, NodeType
from modules.graph.service import GraphService


class FakeGraphRepository:
    def __init__(self):
        self.calls = []

    def get_all_nodes(self, limit=500):
        self.calls.append(("get_all_nodes", limit))
        return ["all-nodes"]

    def get_nodes_by_type(self, node_type, limit=100):
        self.calls.append(("get_nodes_by_type", node_type, limit))
        return ["typed-nodes"]

    def get_neighbors(self, node_id):
        self.calls.append(("get_neighbors", node_id))
        return NodeDetail(node=None, incoming=[], outgoing=[], neighbor_nodes=[])

    def search_nodes(self, query, limit=20):
        self.calls.append(("search_nodes", query, limit))
        return ["search-results"]

    def get_subgraph(self, node_ids, depth=1):
        self.calls.append(("get_subgraph", node_ids, depth))
        return "subgraph"

    def get_all_edges(self, limit=1000):
        self.calls.append(("get_all_edges", limit))
        return ["edges"]

    def get_timeline(self, days=30, limit=50):
        self.calls.append(("get_timeline", days, limit))
        return ["timeline"]

    def get_stats(self):
        self.calls.append(("get_stats",))
        return {"total_nodes": 1}


class FakePipeline:
    async def run(self):
        return {"created": 1}


def test_list_nodes_without_type_uses_all_nodes():
    repo = FakeGraphRepository()
    service = GraphService(repo)

    result = service.list_nodes(node_type=None, limit=25)

    assert result == ["all-nodes"]
    assert repo.calls == [("get_all_nodes", 25)]


def test_list_nodes_with_type_uses_typed_nodes():
    repo = FakeGraphRepository()
    service = GraphService(repo)

    result = service.list_nodes(node_type=NodeType.TECHNOLOGY, limit=25)

    assert result == ["typed-nodes"]
    assert repo.calls == [("get_nodes_by_type", NodeType.TECHNOLOGY, 25)]


def test_get_node_detail_raises_business_error_when_node_missing():
    repo = FakeGraphRepository()
    service = GraphService(repo)

    with pytest.raises(AppError) as exc_info:
        service.get_node_detail("missing-node")

    assert exc_info.value.code == "GRAPH_NODE_NOT_FOUND"
    assert exc_info.value.status_code == 404
    assert exc_info.value.details == {"nodeId": "missing-node"}


def test_trigger_sync_raises_when_pipeline_missing():
    service = GraphService(FakeGraphRepository())

    with pytest.raises(AppError) as exc_info:
        asyncio.run(service.trigger_sync(None))

    assert exc_info.value.code == "GRAPH_PIPELINE_UNAVAILABLE"
    assert exc_info.value.status_code == 503


def test_trigger_sync_runs_pipeline():
    service = GraphService(FakeGraphRepository())

    result = asyncio.run(service.trigger_sync(FakePipeline()))

    assert result == {"created": 1}
