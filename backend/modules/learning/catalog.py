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
        "title": "Secure MCP Server",
        "status": "Draft",
        "difficulty": "Intermediate",
        "estimatedSetupTime": "15min",
        "estimatedCost": "< $1",
        "requiresApiKey": True,
        "path": "labs/secure-mcp-server",
        "commands": [
            "cd labs/secure-mcp-server",
            "python -m venv .venv",
            "pip install -r requirements.txt",
            "python -m pytest tests -q",
            "python main.py",
        ],
        "summary": "MCP Server baseline lab with tool allowlist, parameter validation, audit logs, and basic input protection.",
    },
    {
        "id": "production-agent-with-human-approval",
        "title": "Production Agent with Human Approval",
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
        "summary": "Production agent lab showing human approval, task state transitions, and operational boundaries.",
    },
]
