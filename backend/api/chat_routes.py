"""RAG Chat API — natural language queries over the knowledge graph."""

import re
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List
from models.repository import GraphRepository

router = APIRouter(prefix="/graph", tags=["chat"])


def get_repo() -> GraphRepository:
    """Dependency injection — get repository from app state."""
    from main import app
    return GraphRepository(app.state.neo4j_driver)


# ── Request / Response models ─────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000, description="User's question")
    history: List[ChatMessage] = Field(default_factory=list, description="Previous conversation messages")


class NodeRef(BaseModel):
    """A reference to a graph node cited in the answer."""
    id: str
    name: str
    node_type: str
    summary_zh: str = ""


class ChatResponse(BaseModel):
    answer: str
    references: List[NodeRef] = Field(default_factory=list)
    nodes_consulted: int = 0


# ── Route ──────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    repo: GraphRepository = Depends(get_repo),
):
    """Ask a question about the AI knowledge graph in natural language.

    The endpoint searches the graph for relevant nodes, retrieves their
    neighborhood context, and uses an LLM to generate an answer with
    clickable node references.
    """
    # 1. Search for relevant nodes
    search_results = repo.search_nodes(req.question, limit=15)

    # 2. Get neighborhood for top results
    context_nodes: List[dict] = []
    seen_ids: set = set()

    for node in search_results[:8]:
        if node.id in seen_ids:
            continue
        seen_ids.add(node.id)
        context_nodes.append({
            "id": node.id,
            "name": node.name,
            "type": node.node_type.value if hasattr(node.node_type, 'value') else str(node.node_type),
            "description": node.description,
            "summary_zh": node.summary_zh,
            "popularity": node.popularity,
        })

        # Get immediate neighbors for richer context
        try:
            detail = repo.get_neighbors(node.id)
            if detail.neighbor_nodes:
                for neighbor in detail.neighbor_nodes[:5]:
                    if neighbor.id not in seen_ids:
                        seen_ids.add(neighbor.id)
                        context_nodes.append({
                            "id": neighbor.id,
                            "name": neighbor.name,
                            "type": neighbor.node_type.value if hasattr(neighbor.node_type, 'value') else str(neighbor.node_type),
                            "description": neighbor.description,
                            "summary_zh": neighbor.summary_zh,
                            "popularity": neighbor.popularity,
                        })
        except Exception:
            pass  # Skip neighbor retrieval errors gracefully

    # 3. Build graph context string for LLM
    context_parts: List[str] = []
    for n in context_nodes:
        parts = [f"[{n['id']}] {n['name']} (类型: {n['type']})"]
        if n.get("summary_zh"):
            parts.append(f"  摘要: {n['summary_zh']}")
        if n.get("description"):
            parts.append(f"  详情: {n['description']}")
        context_parts.append("\n".join(parts))

    graph_context = "\n\n".join(context_parts) if context_parts else "（图谱中暂无相关信息）"

    # 4. Build chat prompt
    from knowledge.prompts import CHAT_SYSTEM, CHAT_USER_TEMPLATE

    # Format history
    history_str = ""
    if req.history:
        history_lines = []
        for msg in req.history[-6:]:  # Last 6 messages for context
            role_label = "用户" if msg.role == "user" else "助手"
            history_lines.append(f"{role_label}: {msg.content}")
        history_str = "\n".join(history_lines)
    else:
        history_str = "（新对话）"

    system_prompt = CHAT_SYSTEM.format(context=graph_context)
    user_prompt = CHAT_USER_TEMPLATE.format(question=req.question, history=history_str)

    # 5. Call LLM
    try:
        from langchain.chat_models import init_chat_model
        from langchain_core.messages import SystemMessage, HumanMessage
        from config import settings

        model = init_chat_model(
            settings.llm_model,
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url or None,
        )
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]
        response = await model.ainvoke(messages)
        # LangChain content can be str | list — coerce to str
        raw_content = response.content
        answer_text: str = raw_content if isinstance(raw_content, str) else str(raw_content)
    except Exception as e:
        # Fallback: return context without LLM answer
        answer_text = f"抱歉，AI 服务暂时不可用（{str(e)[:100]}）。以下是知识图谱中找到的相关节点：\n\n" + \
                      "\n".join(f"- **{n['name']}** ({n['type']}): {n.get('summary_zh', n.get('description', ''))}"
                                for n in context_nodes[:10])

    # 6. Extract referenced node IDs from answer
    ref_pattern = re.compile(r'\[\[([a-zA-Z0-9_-]+)\|([^\]]+)\]\]')
    ref_matches = ref_pattern.findall(answer_text)
    referenced_ids = set(mid for mid, _ in ref_matches)

    references: List[NodeRef] = []
    for n in context_nodes:
        if n["id"] in referenced_ids:
            references.append(NodeRef(
                id=n["id"],
                name=n["name"],
                node_type=n["type"],
                summary_zh=n.get("summary_zh", ""),
            ))

    return ChatResponse(
        answer=answer_text,
        references=references,
        nodes_consulted=len(context_nodes),
    )
