"""Compare data access.

The first Compare article is intentionally kept behind the repository boundary so
the seed can move to Postgres or a content file later without changing the router
and frontend contract — the same approach as the radar module.
"""

from modules.compare.schemas import CompareArticle, CompareCategory


COMPARE_ARTICLES = [
    {
        "id": "mcp-vs-function-calling-vs-rest",
        "title": "MCP vs Function Calling vs REST 工具接入怎么选",
        "category": "mcp",
        "status": "Verified",
        "summary": (
            "单应用内让一个模型调用少量工具用 Function Calling；需要在多个客户端间"
            "复用同一套工具、并施加统一权限边界时用 MCP；工具本身是稳定的服务能力、"
            "调用方不止 LLM 时保留 REST。"
        ),
        "contenders": [
            {
                "name": "Function Calling",
                "vendor": "OpenAI / Anthropic 等模型厂商",
                "latest_version": "厂商 API 内置",
                "one_liner": "模型原生的结构化工具调用，工具 schema 直接随请求下发。",
            },
            {
                "name": "MCP",
                "vendor": "Model Context Protocol（Anthropic 主导，开放规范）",
                "latest_version": "2025-06 规范",
                "one_liner": "把工具/资源封装成独立 Server，多个客户端按统一协议接入。",
            },
            {
                "name": "REST API",
                "vendor": "通用 HTTP 服务",
                "latest_version": "—",
                "one_liner": "把能力暴露为 HTTP 端点，任意调用方（含非 LLM）都能用。",
            },
        ],
        "dimensions": [
            {
                "name": "调用方",
                "values": {
                    "Function Calling": "单个模型/会话",
                    "MCP": "任意支持 MCP 的客户端",
                    "REST API": "任意 HTTP 客户端（人、服务、LLM）",
                },
            },
            {
                "name": "工具复用",
                "values": {
                    "Function Calling": "每个应用各自声明，难跨应用复用",
                    "MCP": "一次实现，多客户端共享",
                    "REST API": "服务级复用，但需自行描述给模型",
                },
            },
            {
                "name": "权限与安全边界",
                "values": {
                    "Function Calling": "由宿主应用自行控制",
                    "MCP": "在 Server 侧集中做 allowlist/校验/审计",
                    "REST API": "标准 API 鉴权，但模型语义未知",
                },
            },
            {
                "name": "模型可发现性",
                "values": {
                    "Function Calling": "原生，schema 即调用契约",
                    "MCP": "协议自带工具发现",
                    "REST API": "需额外把 OpenAPI 转成工具描述",
                },
            },
            {
                "name": "接入成本",
                "values": {
                    "Function Calling": "最低，直接写 schema",
                    "MCP": "需实现/部署 Server",
                    "REST API": "已有服务则低，否则需先建服务",
                },
            },
        ],
        "use_when": [
            {
                "contender": "Function Calling",
                "scenario": "单个应用内，模型调用有限且专属的工具，追求最快落地。",
            },
            {
                "contender": "MCP",
                "scenario": "同一套工具要被多个助手/IDE/客户端复用，且需要统一的权限与审计边界。",
            },
            {
                "contender": "REST API",
                "scenario": "能力本身是稳定的后端服务，调用方不止 LLM，或已有成熟 REST 生态。",
            },
        ],
        "avoid_when": [
            {
                "contender": "Function Calling",
                "scenario": "需要跨多个客户端共享工具，或要在工具层做集中式安全治理。",
            },
            {
                "contender": "MCP",
                "scenario": "只有一个应用、少量工具的简单场景——引入 Server 是过度设计。",
            },
            {
                "contender": "REST API",
                "scenario": "希望模型自动发现并结构化调用工具，却不想额外维护工具描述层。",
            },
        ],
        "decision_tree": [
            {
                "condition": "工具只在一个应用里被一个模型调用",
                "recommendation": "Function Calling",
            },
            {
                "condition": "同一套工具要被多个客户端复用，并需统一权限/审计",
                "recommendation": "MCP（参考 Secure MCP Server Lab 的安全边界）",
            },
            {
                "condition": "调用方包含非 LLM 系统，或已有稳定 REST 服务",
                "recommendation": "REST API，必要时再包一层 MCP/Function schema",
            },
        ],
        "cost_notes": [
            "Function Calling 学习成本最低，但工具治理逻辑会散落在每个应用里。",
            "MCP 需要额外实现和部署 Server，换来的是跨客户端复用与集中安全边界。",
            "REST 若已有服务几乎零额外成本，但要让模型用好需自建工具描述与调用适配。",
        ],
        "sources": [
            {
                "type": "official",
                "title": "Model Context Protocol specification",
                "url": "https://modelcontextprotocol.io/specification",
            },
            {
                "type": "official",
                "title": "OpenAI function calling guide",
                "url": "https://platform.openai.com/docs/guides/function-calling",
            },
            {
                "type": "official",
                "title": "Anthropic tool use documentation",
                "url": "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
            },
        ],
        "related_lab_ids": ["secure-mcp-server"],
        "related_radar_item_ids": ["mcp-security-boundary-2026-07"],
        "related_node_ids": ["MCP", "Tool Calling", "Tool Allowlist"],
        "related_learning_paths": [
            "/learn/agent-engineer/module-03-mcp/01-mcp-protocol-principles"
        ],
        "published_at": "2026-07-09T10:00:00Z",
        "created_at": "2026-07-09T10:00:00Z",
        "updated_at": "2026-07-09T10:00:00Z",
        "last_verified_at": "2026-07-09T10:00:00Z",
    },
]


CATEGORY_DETAILS = {
    "mcp": CompareCategory(
        id="mcp",
        name="工具接入与协议",
        description="MCP、Function Calling、REST 等工具接入方式的选型",
    ),
    "agent-framework": CompareCategory(
        id="agent-framework",
        name="Agent 框架",
        description="Agent 框架与运行时的选型",
    ),
    "rag": CompareCategory(
        id="rag",
        name="检索增强",
        description="RAG 相关技术的选型",
    ),
}


class CompareRepository:
    def list_articles(self) -> list[CompareArticle]:
        return [CompareArticle(**article) for article in COMPARE_ARTICLES]

    def get_article(self, article_id: str) -> CompareArticle | None:
        for article in self.list_articles():
            if article.id == article_id:
                return article
        return None

    def list_categories(self) -> list[CompareCategory]:
        category_ids = sorted({article.category for article in self.list_articles()})
        return [
            CATEGORY_DETAILS.get(
                category_id,
                CompareCategory(
                    id=category_id,
                    name=category_id.replace("-", " ").title(),
                    description="",
                ),
            )
            for category_id in category_ids
        ]
