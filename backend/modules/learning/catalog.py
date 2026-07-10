"""Backend-owned learning catalog metadata."""

from typing import Any


ROADMAP: list[dict[str, str]] = [
    {
        "layer": "01",
        "title": "Agent foundations",
        "eyebrow": "Concepts",
        "description": "Understand agents, tool use, MCP, design patterns, and multi-agent collaboration.",
        "modules": "Modules 1-5",
        "accent": "bg-stellar-blue",
    },
    {
        "layer": "02",
        "title": "Production engineering",
        "eyebrow": "Production",
        "description": "Add observability, error handling, security, RAG, fine-tuning, and inference optimization.",
        "modules": "Modules 6-10",
        "accent": "bg-stellar-emerald",
    },
    {
        "layer": "03",
        "title": "Platform governance",
        "eyebrow": "Platform",
        "description": "Turn demos into systems with SDKs, LangGraph, MCP governance, and evaluation pipelines.",
        "modules": "Module 11",
        "accent": "bg-stellar-violet",
    },
    {
        "layer": "04",
        "title": "Product systems",
        "eyebrow": "Product",
        "description": "Explore voice, multimodal documents, coding agents, synthetic data, and deployment workflows.",
        "modules": "Module 12",
        "accent": "bg-stellar-rose",
    },
]

NEXT_STEPS: list[str] = [
    "Upgrade graph search into GraphRAG with entities, relationships, community summaries, and local/global queries.",
    "Add vector search and hybrid retrieval with full-text search, embeddings, and reranking.",
    "Add runtime state to agents: sessions, checkpoints, human approval, and task recovery.",
    "Build an evaluation loop with test sets, scorers, regression gates, and trace inspection.",
    "Add trust fields: source, publish time, confidence, and last verification time.",
]

STAGE_LABELS: dict[int, dict[str, str]] = {
    1: {"title": "感知", "goal": "亲手触摸 AI，建立体感"},
    2: {"title": "理解", "goal": "理解工作机制，能自己改造"},
    3: {"title": "连接", "goal": "让 Agent 连接真实世界"},
    4: {"title": "设计", "goal": "掌握设计模式，独立设计架构"},
    5: {"title": "交付", "goal": "生产级交付"},
    6: {"title": "扩展", "goal": "深度掌握企业级 AI 全栈"},
}

ANALOGIES: dict[str, dict[str, str]] = {
    "agent": {
        "analogy": "一个能自己上网查资料、动手操作的实习程序员",
        "oneLiner": "AI + 工具 + 自主决策",
    },
    "mcp": {
        "analogy": "USB-C 接口标准——任何设备都能插",
        "oneLiner": "Agent 和工具的通用连接标准",
    },
    "function-calling": {
        "analogy": "你给 AI 一本菜单，它点菜，你上菜",
        "oneLiner": "AI 说想调什么函数，你来执行",
    },
    "rag": {
        "analogy": "考试带参考书——先翻书找答案，再写卷子",
        "oneLiner": "先检索知识，再让 AI 回答",
    },
    "pipeline": {
        "analogy": "工厂流水线——每站只做一件事，做完传给下一站",
        "oneLiner": "A→B→C，数据按序流动",
    },
    "orchestrator": {
        "analogy": "包工头带施工队——包工头派活，工人各自干自己的",
        "oneLiner": "中央调度 → 并行执行 → 汇总",
    },
    "human-in-the-loop": {
        "analogy": "飞机起飞前的塔台批准——关键操作必须人点头",
        "oneLiner": "AI 做事，人在关键时刻拍板",
    },
    "token": {
        "analogy": "AI 阅读的\"字\"——一个汉字≈2 token",
        "oneLiner": "AI 按字数收费的基本单位",
    },
    "embedding": {
        "analogy": "把一段文字的\"意思\"压缩成一串数字坐标",
        "oneLiner": "语义相近的文字≈坐标靠近的点",
    },
    "vector-db": {
        "analogy": "超级智能的\"找相似\"引擎",
        "oneLiner": "不按关键词搜，按意思搜",
    },
}

DIFFICULTY_LABELS: dict[str, str] = {
    "beginner": "入门",
    "intermediate": "进阶",
    "advanced": "深入",
}

CATEGORY_LABELS: dict[str, str] = {
    "orchestration": "基础编排",
    "collaboration": "协作模式",
    "quality": "质量保障",
    "architecture": "架构模式",
}

LABS: list[dict[str, Any]] = [
    {
        "id": "secure-mcp-server",
        "title": {"zh": "安全 MCP Server", "en": "Secure MCP Server"},
        "status": "Verified",
        "difficulty": "Intermediate",
        "estimatedSetupTime": "15min",
        "estimatedCost": "< $1",
        "requiresApiKey": True,
        "path": "labs/secure-mcp-server",
        "lastVerifiedAt": "2026-07-09",
        "packages": [
            {"name": "fastapi", "version": "0.115.0"},
            {"name": "uvicorn", "version": "0.30.0"},
            {"name": "pydantic", "version": "2.9.0"},
            {"name": "pydantic-settings", "version": "2.5.0"},
            {"name": "python-dotenv", "version": "1.2.2"},
            {"name": "structlog", "version": "24.1.0"},
            {"name": "slowapi", "version": "0.1.9"},
            {"name": "pyyaml", "version": "6.0.1"},
            {"name": "requests", "version": "2.31.0"},
        ],
        "commands": [
            "cd labs/secure-mcp-server",
            "python -m venv .venv",
            "pip install -r requirements.txt",
            "python -m pytest tests -q",
            "python main.py",
        ],
        "expectedOutputs": [
            {
                "zh": "pytest 报告 Secure MCP Server 的所有测试通过。",
                "en": "pytest reports all Secure MCP Server tests passing.",
            },
            {
                "zh": "Server 运行时，GET /mcp/health 返回 status=healthy。",
                "en": "GET /mcp/health returns status=healthy when the server is running.",
            },
            {
                "zh": "未授权的工具在执行前就会被拒绝。",
                "en": "Unauthorized tools are rejected before execution.",
            },
            {
                "zh": "非法参数会返回校验错误，而不会进入工具逻辑。",
                "en": "Invalid parameters return validation errors instead of reaching tool logic.",
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
                "title": "FastAPI documentation",
                "url": "https://fastapi.tiangolo.com/",
            },
            {
                "type": "official",
                "title": "Pydantic documentation",
                "url": "https://docs.pydantic.dev/",
            },
        ],
        "failureModes": [
            {
                "title": {"zh": "缺少 API Key", "en": "Missing API key"},
                "resolution": {
                    "zh": "启动服务前，把 .env.example 复制为 .env 并设置 API_KEY。",
                    "en": "Copy .env.example to .env and set API_KEY before starting the server.",
                },
            },
            {
                "title": {"zh": "8000 端口已被占用", "en": "Port 8000 already in use"},
                "resolution": {
                    "zh": "运行 python main.py 前，停掉占用端口的进程或更换本地端口。",
                    "en": "Stop the existing process or change the local port before running python main.py.",
                },
            },
            {
                "title": {"zh": "工具被白名单拒绝", "en": "Tool rejected by allowlist"},
                "resolution": {
                    "zh": "确认 ALLOWED_TOOLS 中只包含预期的工具名称。",
                    "en": "Confirm ALLOWED_TOOLS contains only the intended tool names.",
                },
            },
        ],
        "securityNotes": [
            {
                "zh": "工具白名单会在参数处理之前拦截未知的工具名称。",
                "en": "The tool allowlist blocks unknown tool names before parameter handling.",
            },
            {
                "zh": "Pydantic 校验会在执行前拒绝非法的工具参数。",
                "en": "Pydantic validation rejects invalid tool parameters before execution.",
            },
            {
                "zh": "审计日志记录工具调用供审查使用，但不能替代生产环境的集中式日志系统。",
                "en": "Audit logs record tool calls for review, but they are not a substitute for centralized production logging.",
            },
            {
                "zh": "提示注入检测只是一层防御，不是完整的安全边界。",
                "en": "Prompt injection checks are a defense layer, not a complete security boundary.",
            },
        ],
        "knownLimitations": [
            {
                "zh": "本实验使用简单的 API Key 做本地验证，不包含生产环境的身份管理体系。",
                "en": "The lab uses a simple API key for local verification and does not include production identity management.",
            },
            {
                "zh": "限流机制只有文档说明，可运行示例中并未实现。",
                "en": "Rate limiting is documented but not implemented in the runnable sample.",
            },
            {
                "zh": "审计日志只输出到本地文件，未接入 SIEM 或链路追踪平台。",
                "en": "The audit log is local file output and is not wired to a SIEM or tracing platform.",
            },
        ],
        "relatedRadarItemIds": ["mcp-security-boundary-2026-07"],
        "relatedCompareIds": ["mcp-vs-function-calling-vs-rest"],
        "relatedNodeIds": ["MCP", "Tool Allowlist", "Prompt Injection"],
        "relatedLearningPaths": [
            {
                "title": {"zh": "MCP 协议原理", "en": "MCP protocol principles"},
                "href": "/learn/agent-engineer/module-03-mcp/01-mcp-protocol-principles",
            },
            {
                "title": {"zh": "构建 MCP Server", "en": "Build MCP Server"},
                "href": "/learn/agent-engineer/module-03-mcp/02-build-mcp-server",
            },
        ],
        "summary": {
            "zh": "已验证的 MCP Server 基线实验，包含工具白名单、参数校验、审计日志和明确的安全边界文档。",
            "en": "Verified MCP Server baseline lab with tool allowlist, parameter validation, audit logs, and documented security boundaries.",
        },
    },
    {
        "id": "production-agent-with-human-approval",
        "title": {"zh": "带人工审批的生产级 Agent", "en": "Production Agent with Human Approval"},
        "status": "Draft",
        "difficulty": "Intermediate",
        "estimatedSetupTime": "20min",
        "estimatedCost": "< $1",
        "requiresApiKey": True,
        "path": "labs/production-agent-with-human-approval",
        "commands": [
            "cd labs/production-agent-with-human-approval",
            "python -m venv .venv",
            "pip install -r requirements.txt",
            "python -m pytest tests -q",
            "python src/main.py",
        ],
        "summary": {
            "zh": "展示人工审批、任务状态流转和运维边界的生产级 Agent 实验。",
            "en": "Production agent lab showing human approval, task state transitions, and operational boundaries.",
        },
    },
]
