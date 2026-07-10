"""Radar data access.

The first Radar issue is intentionally small. Each item is kept behind the
repository boundary so the seed can move to Postgres or a content file later
without changing the router and frontend contract.

Prose fields are stored as {"zh": ..., "en": ...} and collapsed to a plain
string by common.i18n.resolve_locale before being handed to the RadarItem/
RadarCategory Pydantic models, so schemas.py stays locale-agnostic.
"""

from common.i18n import DEFAULT_LOCALE, resolve_locale
from modules.radar.schemas import RadarCategory, RadarItem


RADAR_ITEMS = [
    {
        "id": "openai-agents-sdk-production-patterns-2026-07",
        "title": {
            "zh": "OpenAI Agents SDK 将生产级 Agent 构建模块标准化",
            "en": "OpenAI Agents SDK formalizes production agent building blocks",
        },
        "category": "agent-framework",
        "status": "Verified",
        "maturity": "Early Adoption",
        "summary": {
            "zh": "OpenAI 的 Agents 指南把工具调用、任务交接、追踪和护栏机制变成了一等公民的应用模式。",
            "en": "OpenAI's Agents guidance turns tool use, handoffs, tracing, and guardrails into first-class application patterns.",
        },
        "why_it_matters": {
            "zh": "Agent 开发正从临时拼凑的对话循环，转向平台原生支持、可观测、可约束、可测试的基础组件。",
            "en": "Agent work is moving from ad hoc chat loops toward platform-supported primitives that teams can observe, constrain, and test.",
        },
        "recommended_for": {
            "zh": "已经基于 OpenAI 模型开发、需要官方支持的工具调用助手和工作流交接方案的团队。",
            "en": "Teams already building on OpenAI models that need a supported path for tool-using assistants and workflow handoffs.",
        },
        "not_recommended_for": {
            "zh": "需要强跨模型可移植性、或以图状态机作为主要抽象方式的团队。",
            "en": "Teams that require strong cross-model portability or graph-shaped state machines as the primary abstraction.",
        },
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
        "title": {
            "zh": "MCP Server 上生产前必须显式划定安全边界",
            "en": "MCP servers need explicit security boundaries before production use",
        },
        "category": "mcp",
        "status": "Verified",
        "maturity": "Early Adoption",
        "summary": {
            "zh": "MCP 提升了工具互操作性，但生产环境的 Server 仍然需要白名单、输入校验、审计日志和最小权限执行。",
            "en": "MCP improves tool interoperability, but production servers still need allowlists, input validation, audit logs, and least-privilege execution.",
        },
        "why_it_matters": {
            "zh": "可复用的工具协议扩大了 Agent 的影响半径，安全控制必须建在 Server 周围，而不能只依赖提示词。",
            "en": "A reusable tool protocol expands an agent's blast radius. Security controls must live around the server, not only in prompts.",
        },
        "recommended_for": {
            "zh": "通过 MCP 暴露内部工具、或正在为共享环境准备本地 MCP 原型的团队。",
            "en": "Teams exposing internal tools through MCP or preparing local MCP prototypes for shared environments.",
        },
        "not_recommended_for": {
            "zh": "没有身份认证、权限边界和可审计日志就对外公开部署的场景。",
            "en": "Public deployment without authentication, permission boundaries, and reviewable audit trails.",
        },
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
        "title": {
            "zh": "有状态的 Agent 工作流更适合用图运行时而非线性链",
            "en": "Stateful agent workflows favor graph runtimes over linear chains",
        },
        "category": "agent-framework",
        "status": "Verified",
        "maturity": "Production Ready",
        "summary": {
            "zh": "LangGraph 的持久化、中断和人工介入机制，使它非常适合长时间运行的 Agent 工作流。",
            "en": "LangGraph's persistence, interrupts, and human-in-the-loop patterns make it a strong fit for long-running agent workflows.",
        },
        "why_it_matters": {
            "zh": "生产环境的 Agent 需要故障恢复、审核节点和可恢复状态，这些需求很难事后补到简单的请求-响应链上。",
            "en": "Production agents need recovery, review points, and resumable state. Those requirements are difficult to retrofit onto a simple request-response chain.",
        },
        "recommended_for": {
            "zh": "带检查点、审批环节、重试逻辑和多条执行分支的复杂工作流。",
            "en": "Complex workflows with checkpoints, approvals, retries, and multiple execution branches.",
        },
        "not_recommended_for": {
            "zh": "简单的单轮自动化任务，普通函数调用或轻量工作流就足够的场景。",
            "en": "Small single-turn automations where a plain function call or lightweight workflow is enough.",
        },
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
        "title": {
            "zh": "混合检索应该成为 RAG 的默认基线方案",
            "en": "Hybrid retrieval should be the default RAG baseline",
        },
        "category": "rag",
        "status": "Verified",
        "maturity": "Production Ready",
        "summary": {
            "zh": "将稠密向量检索与关键词/稀疏检索结合，已经是生产环境 RAG 评估中务实的默认基线。",
            "en": "Combining dense vector retrieval with keyword or sparse retrieval is now the pragmatic baseline for production RAG evaluation.",
        },
        "why_it_matters": {
            "zh": "纯向量搜索容易漏掉精确标识符、API 名称和低频词，混合检索能在引入重排序或 GraphRAG 之前给团队一个更扎实的基线。",
            "en": "Pure vector search can miss exact identifiers, API names, and rare terms. Hybrid retrieval gives teams a stronger baseline before adding rerankers or GraphRAG.",
        },
        "recommended_for": {
            "zh": "服务于技术文档、支持知识库、以及包含大量精确术语内容的 RAG 系统。",
            "en": "RAG systems serving technical documentation, support knowledge bases, and content with many exact terms.",
        },
        "not_recommended_for": {
            "zh": "检索质量不是瓶颈的小型演示或单文档助手场景。",
            "en": "Tiny demos or single-document assistants where retrieval quality is not the bottleneck.",
        },
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
        "title": {
            "zh": "LLM 评估正在从一次性 notebook 变成发布门禁",
            "en": "LLM evals are becoming release gates, not one-off notebooks",
        },
        "category": "evaluation",
        "status": "Verified",
        "maturity": "Early Adoption",
        "summary": {
            "zh": "评估套件正在被纳入 CI 和发布流程，让团队能在用户之前发现提示词、模型和检索环节的回归问题。",
            "en": "Evaluation suites are moving into CI and release workflows so teams can catch prompt, model, and retrieval regressions before users do.",
        },
        "why_it_matters": {
            "zh": "即使代码没变，提示词、数据、模型版本或检索行为的漂移也会让 AI 功能出现回归。发布门禁能让质量变得可见、可重复。",
            "en": "AI features can regress without code changes when prompts, data, model versions, or retrieval behavior drift. Release gates make quality visible and repeatable.",
        },
        "recommended_for": {
            "zh": "持续迭代提示词或模型、正在上线 RAG、Agent 或结构化抽取流程的团队。",
            "en": "Teams shipping RAG, agents, or structured extraction flows with recurring prompt or model changes.",
        },
        "not_recommended_for": {
            "zh": "任务定义、数据集或预期行为都还不稳定的实验性项目。",
            "en": "Experiments without a stable task definition, dataset, or expected behavior.",
        },
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
    "agent-framework": {
        "id": "agent-framework",
        "name": {"zh": "Agent 框架", "en": "Agent Frameworks"},
        "description": {
            "zh": "用于构建和部署 AI Agent 的框架",
            "en": "Frameworks for building and deploying AI agents",
        },
    },
    "mcp": {
        "id": "mcp",
        "name": {"zh": "Model Context Protocol", "en": "Model Context Protocol"},
        "description": {
            "zh": "标准化协议与工具调用规范",
            "en": "Standardization and tool-calling protocols",
        },
    },
    "rag": {
        "id": "rag",
        "name": {"zh": "检索增强生成（RAG）", "en": "Retrieval Augmented Generation"},
        "description": {
            "zh": "RAG 相关技术、工具与最佳实践",
            "en": "RAG techniques, tools, and best practices",
        },
    },
    "evaluation": {
        "id": "evaluation",
        "name": {"zh": "AI 评估", "en": "AI Evaluation"},
        "description": {
            "zh": "AI 系统的测试与评估",
            "en": "Testing and evaluation of AI systems",
        },
    },
}


class RadarRepository:
    def list_items(self, locale: str = DEFAULT_LOCALE) -> list[RadarItem]:
        return [RadarItem(**resolve_locale(item, locale)) for item in RADAR_ITEMS]

    def get_item(self, item_id: str, locale: str = DEFAULT_LOCALE) -> RadarItem | None:
        for item in self.list_items(locale=locale):
            if item.id == item_id:
                return item
        return None

    def list_categories(self, locale: str = DEFAULT_LOCALE) -> list[RadarCategory]:
        category_ids = sorted({item["category"] for item in RADAR_ITEMS})
        return [
            RadarCategory(
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
