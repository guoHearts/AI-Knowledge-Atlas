"""Compare data access.

The first Compare article is intentionally kept behind the repository boundary so
the seed can move to Postgres or a content file later without changing the router
and frontend contract — the same approach as the radar module.

Prose fields are stored as {"zh": ..., "en": ...} and collapsed to a plain
string by common.i18n.resolve_locale before being handed to the CompareArticle/
CompareCategory Pydantic models, so schemas.py stays locale-agnostic.
"""

from common.i18n import DEFAULT_LOCALE, resolve_locale
from modules.compare.schemas import CompareArticle, CompareCategory


COMPARE_ARTICLES = [
    {
        "id": "mcp-vs-function-calling-vs-rest",
        "title": {
            "zh": "MCP vs Function Calling vs REST 工具接入怎么选",
            "en": "MCP vs Function Calling vs REST: Choosing a Tool-Integration Approach",
        },
        "category": "mcp",
        "status": "Verified",
        "summary": {
            "zh": (
                "单应用内让一个模型调用少量工具用 Function Calling；需要在多个客户端间"
                "复用同一套工具、并施加统一权限边界时用 MCP；工具本身是稳定的服务能力、"
                "调用方不止 LLM 时保留 REST。"
            ),
            "en": (
                "Use Function Calling when a single model in one app calls a handful of "
                "tools. Use MCP when the same toolset must be reused across multiple "
                "clients under a unified permission boundary. Keep REST when the "
                "capability is a stable backend service consumed by more than just LLMs."
            ),
        },
        "contenders": [
            {
                "name": "Function Calling",
                "vendor": {
                    "zh": "OpenAI / Anthropic 等模型厂商",
                    "en": "Model vendors (OpenAI, Anthropic, etc.)",
                },
                "latest_version": {"zh": "厂商 API 内置", "en": "Built into vendor APIs"},
                "one_liner": {
                    "zh": "模型原生的结构化工具调用，工具 schema 直接随请求下发。",
                    "en": "Native structured tool calling — the tool schema ships directly with the request.",
                },
            },
            {
                "name": "MCP",
                "vendor": {
                    "zh": "Model Context Protocol（Anthropic 主导，开放规范）",
                    "en": "Model Context Protocol (led by Anthropic, an open specification)",
                },
                "latest_version": {"zh": "2025-06 规范", "en": "2025-06 specification"},
                "one_liner": {
                    "zh": "把工具/资源封装成独立 Server，多个客户端按统一协议接入。",
                    "en": "Wraps tools/resources in a standalone server that multiple clients connect to over one protocol.",
                },
            },
            {
                "name": "REST API",
                "vendor": {"zh": "通用 HTTP 服务", "en": "General-purpose HTTP services"},
                "latest_version": {"zh": "—", "en": "—"},
                "one_liner": {
                    "zh": "把能力暴露为 HTTP 端点，任意调用方（含非 LLM）都能用。",
                    "en": "Exposes a capability as an HTTP endpoint that any caller — including non-LLM ones — can use.",
                },
            },
        ],
        "dimensions": [
            {
                "name": {"zh": "调用方", "en": "Caller"},
                "values": {
                    "Function Calling": {"zh": "单个模型/会话", "en": "A single model/session"},
                    "MCP": {"zh": "任意支持 MCP 的客户端", "en": "Any MCP-compatible client"},
                    "REST API": {
                        "zh": "任意 HTTP 客户端（人、服务、LLM）",
                        "en": "Any HTTP client (humans, services, LLMs)",
                    },
                },
            },
            {
                "name": {"zh": "工具复用", "en": "Tool reuse"},
                "values": {
                    "Function Calling": {
                        "zh": "每个应用各自声明，难跨应用复用",
                        "en": "Declared per app; hard to reuse across apps",
                    },
                    "MCP": {"zh": "一次实现，多客户端共享", "en": "Implement once, share across clients"},
                    "REST API": {
                        "zh": "服务级复用，但需自行描述给模型",
                        "en": "Reusable at the service level, but must be described to the model manually",
                    },
                },
            },
            {
                "name": {"zh": "权限与安全边界", "en": "Permissions & security boundary"},
                "values": {
                    "Function Calling": {
                        "zh": "由宿主应用自行控制",
                        "en": "Controlled entirely by the host application",
                    },
                    "MCP": {
                        "zh": "在 Server 侧集中做 allowlist/校验/审计",
                        "en": "Centralized allowlisting/validation/auditing on the server side",
                    },
                    "REST API": {
                        "zh": "标准 API 鉴权，但模型语义未知",
                        "en": "Standard API auth, but the model's intent is opaque to it",
                    },
                },
            },
            {
                "name": {"zh": "模型可发现性", "en": "Model discoverability"},
                "values": {
                    "Function Calling": {
                        "zh": "原生，schema 即调用契约",
                        "en": "Native — the schema is the calling contract",
                    },
                    "MCP": {"zh": "协议自带工具发现", "en": "Tool discovery is built into the protocol"},
                    "REST API": {
                        "zh": "需额外把 OpenAPI 转成工具描述",
                        "en": "Requires converting OpenAPI into a tool description separately",
                    },
                },
            },
            {
                "name": {"zh": "接入成本", "en": "Integration cost"},
                "values": {
                    "Function Calling": {"zh": "最低，直接写 schema", "en": "Lowest — just write the schema"},
                    "MCP": {
                        "zh": "需实现/部署 Server",
                        "en": "Requires implementing and deploying a server",
                    },
                    "REST API": {
                        "zh": "已有服务则低，否则需先建服务",
                        "en": "Low if the service already exists, otherwise build it first",
                    },
                },
            },
        ],
        "use_when": [
            {
                "contender": "Function Calling",
                "scenario": {
                    "zh": "单个应用内，模型调用有限且专属的工具，追求最快落地。",
                    "en": "A single app where the model calls a small set of app-specific tools and speed to ship matters most.",
                },
            },
            {
                "contender": "MCP",
                "scenario": {
                    "zh": "同一套工具要被多个助手/IDE/客户端复用，且需要统一的权限与审计边界。",
                    "en": "The same toolset must be reused across multiple assistants/IDEs/clients under one permission and audit boundary.",
                },
            },
            {
                "contender": "REST API",
                "scenario": {
                    "zh": "能力本身是稳定的后端服务，调用方不止 LLM，或已有成熟 REST 生态。",
                    "en": "The capability is a stable backend service, callers aren't limited to LLMs, or a mature REST ecosystem already exists.",
                },
            },
        ],
        "avoid_when": [
            {
                "contender": "Function Calling",
                "scenario": {
                    "zh": "需要跨多个客户端共享工具，或要在工具层做集中式安全治理。",
                    "en": "You need to share tools across multiple clients or need centralized security governance at the tool layer.",
                },
            },
            {
                "contender": "MCP",
                "scenario": {
                    "zh": "只有一个应用、少量工具的简单场景——引入 Server 是过度设计。",
                    "en": "A simple single-app scenario with few tools — standing up a server is over-engineering.",
                },
            },
            {
                "contender": "REST API",
                "scenario": {
                    "zh": "希望模型自动发现并结构化调用工具，却不想额外维护工具描述层。",
                    "en": "You want the model to auto-discover and structurally call tools without maintaining a separate tool-description layer.",
                },
            },
        ],
        "decision_tree": [
            {
                "condition": {
                    "zh": "工具只在一个应用里被一个模型调用",
                    "en": "The tool is only ever called by one model in one app",
                },
                "recommendation": {"zh": "Function Calling", "en": "Function Calling"},
            },
            {
                "condition": {
                    "zh": "同一套工具要被多个客户端复用，并需统一权限/审计",
                    "en": "The same toolset must be reused across multiple clients with unified permissions/auditing",
                },
                "recommendation": {
                    "zh": "MCP（参考 Secure MCP Server Lab 的安全边界）",
                    "en": "MCP (see the Secure MCP Server Lab for the security boundary pattern)",
                },
            },
            {
                "condition": {
                    "zh": "调用方包含非 LLM 系统，或已有稳定 REST 服务",
                    "en": "Callers include non-LLM systems, or a stable REST service already exists",
                },
                "recommendation": {
                    "zh": "REST API，必要时再包一层 MCP/Function schema",
                    "en": "REST API, optionally wrapped later with an MCP/Function schema layer",
                },
            },
        ],
        "cost_notes": [
            {
                "zh": "Function Calling 学习成本最低，但工具治理逻辑会散落在每个应用里。",
                "en": "Function Calling has the lowest learning cost, but tool-governance logic ends up scattered across every app.",
            },
            {
                "zh": "MCP 需要额外实现和部署 Server，换来的是跨客户端复用与集中安全边界。",
                "en": "MCP requires extra effort to implement and deploy a server, in exchange for cross-client reuse and a centralized security boundary.",
            },
            {
                "zh": "REST 若已有服务几乎零额外成本，但要让模型用好需自建工具描述与调用适配。",
                "en": "REST costs almost nothing extra if the service already exists, but making the model use it well requires building your own tool-description and call-adaptation layer.",
            },
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
    "mcp": {
        "id": "mcp",
        "name": {"zh": "工具接入与协议", "en": "Tool Integration & Protocols"},
        "description": {
            "zh": "MCP、Function Calling、REST 等工具接入方式的选型",
            "en": "Choosing among MCP, Function Calling, REST, and other tool-integration approaches",
        },
    },
    "agent-framework": {
        "id": "agent-framework",
        "name": {"zh": "Agent 框架", "en": "Agent Frameworks"},
        "description": {
            "zh": "Agent 框架与运行时的选型",
            "en": "Choosing an agent framework and runtime",
        },
    },
    "rag": {
        "id": "rag",
        "name": {"zh": "检索增强", "en": "Retrieval Augmentation"},
        "description": {
            "zh": "RAG 相关技术的选型",
            "en": "Choosing among RAG-related technologies",
        },
    },
}


class CompareRepository:
    def list_articles(self, locale: str = DEFAULT_LOCALE) -> list[CompareArticle]:
        return [CompareArticle(**resolve_locale(article, locale)) for article in COMPARE_ARTICLES]

    def get_article(self, article_id: str, locale: str = DEFAULT_LOCALE) -> CompareArticle | None:
        for article in self.list_articles(locale=locale):
            if article.id == article_id:
                return article
        return None

    def list_categories(self, locale: str = DEFAULT_LOCALE) -> list[CompareCategory]:
        category_ids = sorted({article["category"] for article in COMPARE_ARTICLES})
        return [
            CompareCategory(
                **resolve_locale(
                    CATEGORY_DETAILS.get(
                        category_id,
                        {
                            "id": category_id,
                            "name": {
                                "zh": category_id,
                                "en": category_id.replace("-", " ").title(),
                            },
                            "description": {"zh": "", "en": ""},
                        },
                    ),
                    locale,
                )
            )
            for category_id in category_ids
        ]
