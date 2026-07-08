"""RAG chat service over the knowledge graph."""

import re
from collections.abc import Awaitable, Callable
from typing import Any

from knowledge.prompts import CHAT_SYSTEM, CHAT_USER_TEMPLATE
from modules.chat.schemas import ChatRequest, ChatResponse, NodeRef

AnswerProvider = Callable[[str, str], Awaitable[str]]


def node_type_to_string(node_type: Any) -> str:
    return node_type.value if hasattr(node_type, "value") else str(node_type)


class ChatService:
    def __init__(
        self,
        repo: Any,
        answer_provider: AnswerProvider | None = None,
    ):
        self.repo = repo
        self.answer_provider = answer_provider or generate_llm_answer

    async def chat(self, req: ChatRequest) -> ChatResponse:
        context_nodes = self._collect_context_nodes(req.question)
        graph_context = self._build_graph_context(context_nodes)
        history = self._format_history(req)

        system_prompt = CHAT_SYSTEM.format(context=graph_context)
        user_prompt = CHAT_USER_TEMPLATE.format(question=req.question, history=history)

        try:
            answer_text = await self.answer_provider(system_prompt, user_prompt)
        except Exception as error:
            answer_text = self._fallback_answer(error, context_nodes)

        references = self._extract_references(answer_text, context_nodes)
        return ChatResponse(
            answer=answer_text,
            references=references,
            nodes_consulted=len(context_nodes),
        )

    def _collect_context_nodes(self, question: str) -> list[dict[str, Any]]:
        search_results = self.repo.search_nodes(question, limit=15)
        context_nodes: list[dict[str, Any]] = []
        seen_ids: set[str] = set()

        for node in search_results[:8]:
            if node.id in seen_ids:
                continue
            seen_ids.add(node.id)
            context_nodes.append(self._node_to_context(node))

            try:
                detail = self.repo.get_neighbors(node.id)
                if detail.neighbor_nodes:
                    for neighbor in detail.neighbor_nodes[:5]:
                        if neighbor.id not in seen_ids:
                            seen_ids.add(neighbor.id)
                            context_nodes.append(self._node_to_context(neighbor))
            except Exception:
                pass

        return context_nodes

    def _node_to_context(self, node: Any) -> dict[str, Any]:
        return {
            "id": node.id,
            "name": node.name,
            "type": node_type_to_string(node.node_type),
            "description": node.description,
            "summary_zh": node.summary_zh,
            "popularity": node.popularity,
        }

    def _build_graph_context(self, context_nodes: list[dict[str, Any]]) -> str:
        context_parts: list[str] = []
        for node in context_nodes:
            parts = [f"[{node['id']}] {node['name']} (类型: {node['type']})"]
            if node.get("summary_zh"):
                parts.append(f"  摘要: {node['summary_zh']}")
            if node.get("description"):
                parts.append(f"  详情: {node['description']}")
            context_parts.append("\n".join(parts))

        return "\n\n".join(context_parts) if context_parts else "（图谱中暂无相关信息）"

    def _format_history(self, req: ChatRequest) -> str:
        if not req.history:
            return "（新对话）"

        history_lines: list[str] = []
        for message in req.history[-6:]:
            role_label = "用户" if message.role == "user" else "助手"
            history_lines.append(f"{role_label}: {message.content}")
        return "\n".join(history_lines)

    def _fallback_answer(self, error: Exception, context_nodes: list[dict[str, Any]]) -> str:
        return (
            f"抱歉，AI 服务暂时不可用（{str(error)[:100]}）。以下是知识图谱中找到的相关节点：\n\n"
            + "\n".join(
                f"- **{node['name']}** ({node['type']}): {node.get('summary_zh', node.get('description', ''))}"
                for node in context_nodes[:10]
            )
        )

    def _extract_references(
        self,
        answer_text: str,
        context_nodes: list[dict[str, Any]],
    ) -> list[NodeRef]:
        ref_pattern = re.compile(r"\[\[([a-zA-Z0-9_-]+)\|([^\]]+)\]\]")
        referenced_ids = {node_id for node_id, _ in ref_pattern.findall(answer_text)}

        references: list[NodeRef] = []
        for node in context_nodes:
            if node["id"] in referenced_ids:
                references.append(NodeRef(
                    id=node["id"],
                    name=node["name"],
                    node_type=node["type"],
                    summary_zh=node.get("summary_zh", ""),
                ))
        return references


async def generate_llm_answer(system_prompt: str, user_prompt: str) -> str:
    from config import settings
    from openai import AsyncOpenAI

    client = AsyncOpenAI(
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url or "https://api.openai.com/v1",
    )
    completion = await client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=1024,
    )
    return completion.choices[0].message.content or ""

