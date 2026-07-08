"""Radar data access.

The repository currently uses in-memory seed data. Keeping it behind this
boundary lets the module move to SQLite, PostgreSQL, or Neo4j later without
changing router or frontend contracts.
"""

from modules.radar.schemas import RadarCategory, RadarItem


SAMPLE_RADAR_ITEMS = [
    {
        "id": "openai-agents-sdk-2026-07",
        "title": "OpenAI Agents SDK 1.0 Released",
        "category": "agent-framework",
        "maturity": "Early Production",
        "summary": "OpenAI's first official Agent framework brings standardized tool calling patterns to production applications.",
        "why_it_matters": "Standardizes the agent architecture pattern with built-in safety guardrails, tracing, and structured outputs that enterprises need.",
        "recommended_for": "Teams building production agents with OpenAI models who want guardrails out of the box.",
        "not_recommended_for": "Applications requiring deep customization or multi-model support.",
        "has_lab": True,
        "lab_id": "production-agent-with-human-approval",
        "sources": [
            {
                "type": "official",
                "url": "https://platform.openai.com/docs/guides/agents",
                "title": "OpenAI Agents SDK Documentation",
            },
            {
                "type": "blog",
                "url": "https://openai.com/blog/introducing-the-agents-sdk",
                "title": "Introducing the Agents SDK",
            },
        ],
        "created_at": "2026-07-07T10:00:00Z",
        "updated_at": "2026-07-07T10:00:00Z",
        "last_verified_at": "2026-07-07T10:00:00Z",
    },
    {
        "id": "mcp-security-best-practices-2026-07",
        "title": "MCP Security Best Practices Emerge",
        "category": "mcp",
        "maturity": "Validated",
        "summary": "Security patterns for MCP servers including tool allowlists, parameter validation, and prompt injection defenses are becoming standardized.",
        "why_it_matters": "MCP's promise of reusable tools requires security-first thinking. These patterns prevent common pitfalls in production.",
        "recommended_for": "Anyone deploying MCP servers to production environments.",
        "not_recommended_for": "Local development only scenarios where security is not a concern.",
        "has_lab": True,
        "lab_id": "secure-mcp-server",
        "sources": [
            {
                "type": "community",
                "url": "https://modelcontextprotocol.io/security/security-guide",
                "title": "MCP Security Guide",
            },
            {
                "type": "research",
                "url": "https://arxiv.org/abs/2607.01234",
                "title": "Security Analysis of Tool-Calling Architectures",
            },
        ],
        "created_at": "2026-07-06T14:30:00Z",
        "updated_at": "2026-07-07T09:15:00Z",
        "last_verified_at": "2026-07-07T09:15:00Z",
    },
    {
        "id": "vector-databases-hybrid-search-2026-07",
        "title": "Hybrid Search Becomes Default",
        "category": "rag",
        "maturity": "Production-Ready",
        "summary": "Leading vector databases now default to hybrid search (vector + keyword) as the standard retrieval approach.",
        "why_it_matters": "Hybrid search consistently outperforms pure vector search, closing the relevance gap that has hindered RAG adoption.",
        "recommended_for": "All RAG applications targeting production use cases.",
        "not_recommended_for": "Simple demo applications where implementation complexity is the primary concern.",
        "has_lab": False,
        "lab_id": None,
        "sources": [
            {
                "type": "official",
                "url": "https://qdrant.tech/articles/hybrid-search",
                "title": "Qdrant Hybrid Search Announcement",
            },
            {
                "type": "official",
                "url": "https://weaviate.io/blog/hybrid-search",
                "title": "Weaviate Hybrid Search",
            },
        ],
        "created_at": "2026-07-05T11:20:00Z",
        "updated_at": "2026-07-06T16:45:00Z",
        "last_verified_at": "2026-07-06T16:45:00Z",
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
    "llmops": RadarCategory(
        id="llmops",
        name="LLMOps",
        description="Operations and deployment for AI applications",
    ),
    "model": RadarCategory(
        id="model",
        name="Foundation Models",
        description="New models and model capabilities",
    ),
}


class RadarRepository:
    def list_items(self) -> list[RadarItem]:
        return [RadarItem(**item) for item in SAMPLE_RADAR_ITEMS]

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
