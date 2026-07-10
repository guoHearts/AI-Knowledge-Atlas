import asyncio

from models.graph import GraphNode, NodeDetail, NodeType
from modules.chat.schemas import ChatMessage, ChatRequest
from modules.chat.service import ChatService


def make_node(node_id: str, name: str, summary: str = "") -> GraphNode:
    return GraphNode(
        id=node_id,
        name=name,
        node_type=NodeType.TECHNOLOGY,
        description=f"{name} description",
        summary_zh=summary,
        popularity=80,
    )


class FakeRepository:
    def __init__(self):
        self.rag = make_node("rag", "RAG", "检索增强生成")
        self.mcp = make_node("mcp", "MCP", "模型上下文协议")
        self.calls = []

    def search_nodes(self, query: str, limit: int = 15):
        self.calls.append(("search_nodes", query, limit))
        return [self.rag, self.rag]

    def get_neighbors(self, node_id: str):
        self.calls.append(("get_neighbors", node_id))
        return NodeDetail(node=self.rag, neighbor_nodes=[self.mcp])


async def generated_answer(system_prompt: str, user_prompt: str) -> str:
    assert "检索增强生成" in system_prompt
    assert "用户: 之前的问题" in user_prompt
    return "可以先看 [[rag|RAG]]，再比较 [[mcp|MCP]]。"


async def failing_answer(_system_prompt: str, _user_prompt: str) -> str:
    raise RuntimeError("service unavailable")


def test_chat_service_builds_context_and_extracts_references():
    service = ChatService(FakeRepository(), answer_provider=generated_answer)

    response = asyncio.run(service.chat(ChatRequest(
        question="RAG 和 MCP 怎么关联？",
        history=[ChatMessage(role="user", content="之前的问题")],
    )))

    assert response.answer == "可以先看 [[rag|RAG]]，再比较 [[mcp|MCP]]。"
    assert [ref.id for ref in response.references] == ["rag", "mcp"]
    assert response.nodes_consulted == 2


def test_chat_service_falls_back_when_answer_provider_fails():
    service = ChatService(FakeRepository(), answer_provider=failing_answer)

    response = asyncio.run(service.chat(ChatRequest(question="RAG 是什么？")))

    assert response.answer.startswith("抱歉，AI 服务暂时不可用（service unavailable）")
    assert "- **RAG** (Technology): 检索增强生成" in response.answer
    assert response.references == []
    assert response.nodes_consulted == 2
