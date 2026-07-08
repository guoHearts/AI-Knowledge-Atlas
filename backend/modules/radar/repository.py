"""Radar data access.

The first Radar issue is intentionally small. Each item is kept behind the
repository boundary so the seed can move to Postgres or a content file later
without changing the router and frontend contract.
"""

from modules.radar.schemas import RadarCategory, RadarItem


RADAR_ITEMS = [
    {
        "id": "openai-agents-sdk-production-patterns-2026-07",
        "title": "OpenAI Agents SDK formalizes production agent building blocks",
        "category": "agent-framework",
        "status": "Verified",
        "maturity": "Early Adoption",
        "summary": "OpenAI's Agents guidance turns tool use, handoffs, tracing, and guardrails into first-class application patterns.",
        "why_it_matters": "Agent work is moving from ad hoc chat loops toward platform-supported primitives that teams can observe, constrain, and test.",
        "recommended_for": "Teams already building on OpenAI models that need a supported path for tool-using assistants and workflow handoffs.",
        "not_recommended_for": "Teams that require strong cross-model portability or graph-shaped state machines as the primary abstraction.",
        "has_lab": True,
        "lab_id": "production-agent-with-human-approval",
        "sources": [
            {
                "type": "official",
                "url": "https://platform.openai.com/docs/guides/agents",
                "title": "OpenAI Agents guide",
            }
        ],
        "related_lab_ids": ["production-agent-with-human-approval"],
        "related_node_ids": ["OpenAI", "Agent SDK", "Tool Calling"],
        "related_learning_paths": ["/learn/agent-engineer"],
        "published_at": "2026-07-08T09:00:00Z",
        "created_at": "2026-07-08T09:00:00Z",
        "updated_at": "2026-07-08T09:00:00Z",
        "last_verified_at": "2026-07-08T09:00:00Z",
    },
    {
        "id": "mcp-security-boundary-2026-07",
        "title": "MCP servers need explicit security boundaries before production use",
        "category": "mcp",
        "status": "Verified",
        "maturity": "Early Adoption",
        "summary": "MCP improves tool interoperability, but production servers still need allowlists, input validation, audit logs, and least-privilege execution.",
        "why_it_matters": "A reusable tool protocol expands an agent's blast radius. Security controls must live around the server, not only in prompts.",
        "recommended_for": "Teams exposing internal tools through MCP or preparing local MCP prototypes for shared environments.",
        "not_recommended_for": "Public deployment without authentication, permission boundaries, and reviewable audit trails.",
        "has_lab": True,
        "lab_id": "secure-mcp-server",
        "sources": [
            {
                "type": "official",
                "url": "https://modelcontextprotocol.io/specification",
                "title": "Model Context Protocol specification",
            }
        ],
        "related_lab_ids": ["secure-mcp-server"],
        "related_node_ids": ["MCP", "Tool Allowlist", "Prompt Injection"],
        "related_learning_paths": ["/learn/agent-engineer"],
        "published_at": "2026-07-08T08:30:00Z",
        "created_at": "2026-07-08T08:30:00Z",
        "updated_at": "2026-07-08T08:30:00Z",
        "last_verified_at": "2026-07-08T08:30:00Z",
    },
    {
        "id": "langgraph-stateful-agent-workflows-2026-07",
        "title": "Stateful agent workflows favor graph runtimes over linear chains",
        "category": "agent-framework",
        "status": "Verified",
        "maturity": "Production Ready",
        "summary": "LangGraph's persistence, interrupts, and human-in-the-loop patterns make it a strong fit for long-running agent workflows.",
        "why_it_matters": "Production agents need recovery, review points, and resumable state. Those requirements are difficult to retrofit onto a simple request-response chain.",
        "recommended_for": "Complex workflows with checkpoints, approvals, retries, and multiple execution branches.",
        "not_recommended_for": "Small single-turn automations where a plain function call or lightweight workflow is enough.",
        "has_lab": True,
        "lab_id": "production-agent-with-human-approval",
        "sources": [
            {
                "type": "official",
                "url": "https://docs.langchain.com/oss/python/langgraph/overview",
                "title": "LangGraph overview",
            },
            {
                "type": "official",
                "url": "https://docs.langchain.com/oss/python/langgraph/persistence",
                "title": "LangGraph persistence",
            },
        ],
        "related_lab_ids": ["production-agent-with-human-approval"],
        "related_node_ids": ["LangGraph", "Human In The Loop", "Checkpoint"],
        "related_learning_paths": ["/learn/agent-engineer"],
        "published_at": "2026-07-08T08:00:00Z",
        "created_at": "2026-07-08T08:00:00Z",
        "updated_at": "2026-07-08T08:00:00Z",
        "last_verified_at": "2026-07-08T08:00:00Z",
    },
    {
        "id": "hybrid-rag-baseline-2026-07",
        "title": "Hybrid retrieval should be the default RAG baseline",
        "category": "rag",
        "status": "Verified",
        "maturity": "Production Ready",
        "summary": "Combining dense vector retrieval with keyword or sparse retrieval is now the pragmatic baseline for production RAG evaluation.",
        "why_it_matters": "Pure vector search can miss exact identifiers, API names, and rare terms. Hybrid retrieval gives teams a stronger baseline before adding rerankers or GraphRAG.",
        "recommended_for": "RAG systems serving technical documentation, support knowledge bases, and content with many exact terms.",
        "not_recommended_for": "Tiny demos or single-document assistants where retrieval quality is not the bottleneck.",
        "has_lab": False,
        "lab_id": None,
        "sources": [
            {
                "type": "official",
                "url": "https://qdrant.tech/documentation/concepts/hybrid-queries/",
                "title": "Qdrant hybrid queries",
            },
            {
                "type": "official",
                "url": "https://weaviate.io/developers/weaviate/search/hybrid",
                "title": "Weaviate hybrid search",
            },
        ],
        "related_lab_ids": [],
        "related_node_ids": ["Hybrid Search", "RAG", "Reranking"],
        "related_learning_paths": ["/learn/agent-engineer"],
        "published_at": "2026-07-08T07:30:00Z",
        "created_at": "2026-07-08T07:30:00Z",
        "updated_at": "2026-07-08T07:30:00Z",
        "last_verified_at": "2026-07-08T07:30:00Z",
    },
    {
        "id": "llm-evals-regression-gates-2026-07",
        "title": "LLM evals are becoming release gates, not one-off notebooks",
        "category": "evaluation",
        "status": "Verified",
        "maturity": "Early Adoption",
        "summary": "Evaluation suites are moving into CI and release workflows so teams can catch prompt, model, and retrieval regressions before users do.",
        "why_it_matters": "AI features can regress without code changes when prompts, data, model versions, or retrieval behavior drift. Release gates make quality visible and repeatable.",
        "recommended_for": "Teams shipping RAG, agents, or structured extraction flows with recurring prompt or model changes.",
        "not_recommended_for": "Experiments without a stable task definition, dataset, or expected behavior.",
        "has_lab": False,
        "lab_id": None,
        "sources": [
            {
                "type": "official",
                "url": "https://platform.openai.com/docs/guides/evals",
                "title": "OpenAI Evals guide",
            },
            {
                "type": "official",
                "url": "https://docs.smith.langchain.com/evaluation",
                "title": "LangSmith evaluation docs",
            },
        ],
        "related_lab_ids": [],
        "related_node_ids": ["Evaluation", "Regression Testing", "RAG Evaluation"],
        "related_learning_paths": ["/learn/agent-engineer"],
        "published_at": "2026-07-08T07:00:00Z",
        "created_at": "2026-07-08T07:00:00Z",
        "updated_at": "2026-07-08T07:00:00Z",
        "last_verified_at": "2026-07-08T07:00:00Z",
    },
]

CATEGORY_DETAILS = {
    "agent-framework": RadarCategory(
        id="agent-framework",
        name="Agent Frameworks",
        description="Frameworks for building and deploying AI agents",
    ),
    "mcp": RadarCategory(
        id="mcp",
        name="Model Context Protocol",
        description="Standardization and tool-calling protocols",
    ),
    "rag": RadarCategory(
        id="rag",
        name="Retrieval Augmented Generation",
        description="RAG techniques, tools, and best practices",
    ),
    "evaluation": RadarCategory(
        id="evaluation",
        name="AI Evaluation",
        description="Testing and evaluation of AI systems",
    ),
}


class RadarRepository:
    def list_items(self) -> list[RadarItem]:
        return [RadarItem(**item) for item in RADAR_ITEMS]

    def get_item(self, item_id: str) -> RadarItem | None:
        for item in self.list_items():
            if item.id == item_id:
                return item
        return None

    def list_categories(self) -> list[RadarCategory]:
        category_ids = sorted({item.category for item in self.list_items()})
        return [
            CATEGORY_DETAILS.get(
                category_id,
                RadarCategory(
                    id=category_id,
                    name=category_id.replace("-", " ").title(),
                    description="",
                ),
            )
            for category_id in category_ids
        ]
