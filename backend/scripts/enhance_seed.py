"""Enhance seed data — add Papers, Benchmarks, and more Products/Frameworks.
Run: python scripts/enhance_seed.py
"""

import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from neo4j import GraphDatabase
from models.repository import GraphRepository
from models.graph import GraphNode, GraphEdge, NodeType, RelationType
from datetime import datetime, timezone

driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI", "bolt://localhost:7687"),
    auth=(os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD", "ai-knowledge-graph")),
)
repo = GraphRepository(driver)
now = datetime.now(timezone.utc)

# ============================================================
# === 新增 Papers (AI 领域 2024-2026 重要论文)
# ============================================================
PAPERS = [
    {"id": "paper-attention", "name": "Attention Is All You Need (2017)", "type": NodeType.PAPER,
     "desc": "提出 Transformer 架构的奠基性论文，彻底改变了 NLP 和 AI 领域", "pop": 99},
    {"id": "paper-swe-bench", "name": "SWE-bench: Can Language Models Resolve Real-World GitHub Issues? (ICLR 2024)",
     "type": NodeType.PAPER, "desc": "提出 SWE-bench 代码 Agent 评测基准，成为业界标准", "pop": 92},
    {"id": "paper-graphrag", "name": "From Local to Global: A Graph RAG Approach to Query-Focused Summarization (2024)",
     "type": NodeType.PAPER, "desc": "微软提出 GraphRAG 方法，利用知识图谱增强 LLM 检索", "pop": 88},
    {"id": "paper-lora", "name": "LoRA: Low-Rank Adaptation of Large Language Models (ICLR 2022)",
     "type": NodeType.PAPER, "desc": "提出 LoRA 高效微调方法，仅训练 0.1% 参数即可适配大模型", "pop": 95},
    {"id": "paper-dpo", "name": "Direct Preference Optimization (NeurIPS 2023)",
     "type": NodeType.PAPER, "desc": "提出 DPO 算法，无需奖励模型即可实现偏好对齐，替代 RLHF", "pop": 90},
    {"id": "paper-llama", "name": "LLaMA: Open and Efficient Foundation Language Models (2023)",
     "type": NodeType.PAPER, "desc": "Meta 发布 LLaMA 开源大模型系列，推动开源 AI 生态发展", "pop": 93},
    {"id": "paper-rlhf", "name": "Training Language Models to Follow Instructions with Human Feedback (NeurIPS 2022)",
     "type": NodeType.PAPER, "desc": "OpenAI 提出 RLHF 方法，使 LLM 能够遵循人类指令", "pop": 96},
    {"id": "paper-moe", "name": "Mixture-of-Experts with Expert Choice Routing (NeurIPS 2022)",
     "type": NodeType.PAPER, "desc": "改进的 MoE 路由策略，被 DeepSeek 等模型采用", "pop": 82},
    {"id": "paper-rag", "name": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (NeurIPS 2020)",
     "type": NodeType.PAPER, "desc": "提出 RAG 架构，结合检索增强 LLM 生成质量", "pop": 94},
    {"id": "paper-agent-survey", "name": "From LLM Reasoning to Autonomous AI Agents: A Comprehensive Review (2025)",
     "type": NodeType.PAPER, "desc": "全面综述 2019-2025 约 60 个 Agent Benchmark，覆盖推理/代码/多模态维度", "pop": 85},
    {"id": "paper-tool-tax", "name": "Are Tools All We Need? The Tool-Use Tax (2025)",
     "type": NodeType.PAPER, "desc": "发现工具调用存在隐性成本，tool-use tax 可完全抵消性能收益", "pop": 78},
    {"id": "paper-gaia2", "name": "Gaia2: Dynamic Async Environments for Agent Evaluation (2026)",
     "type": NodeType.PAPER, "desc": "动态异步环境下 GPT-4o/Claude Agent 完成率下降 40%+", "pop": 80},
    {"id": "paper-deepseek-v4", "name": "DeepSeek-V4 Technical Report (2026)",
     "type": NodeType.PAPER, "desc": "深度求索 V4 技术报告，详细介绍 MoE 架构和训练创新", "pop": 88},
    {"id": "paper-qwen3", "name": "Qwen3 Technical Report (2025)",
     "type": NodeType.PAPER, "desc": "阿里通义千问 3 技术报告，开源多尺寸 MoE 模型", "pop": 82},
    {"id": "paper-llama4", "name": "The Llama 4 Herd of Models (2025)",
     "type": NodeType.PAPER, "desc": "Meta Llama 4 技术报告，开源 MoE 多模态模型系列", "pop": 85},
    {"id": "paper-mcp", "name": "Model Context Protocol Specification (2024)",
     "type": NodeType.PAPER, "desc": "Anthropic 提出的 MCP 协议规范，标准化 AI-工具交互", "pop": 80},
    {"id": "paper-grpo", "name": "Group Relative Policy Optimization (2025)",
     "type": NodeType.PAPER, "desc": "DeepSeek 提出的 GRPO 推理增强方法，无需价值模型", "pop": 78},
    {"id": "paper-vllm", "name": "Efficient Memory Management for Large Language Model Serving with PagedAttention (SOSP 2023)",
     "type": NodeType.PAPER, "desc": "提出 PagedAttention 技术，vLLM 推理引擎的核心理念", "pop": 88},
    {"id": "paper-qlora", "name": "QLoRA: Efficient Finetuning of Quantized LLMs (NeurIPS 2023)",
     "type": NodeType.PAPER, "desc": "4-bit 量化 + LoRA，单张消费级 GPU 可微调 70B 模型", "pop": 85},
    {"id": "paper-multimodal", "name": "Gemini: A Family of Highly Capable Multimodal Models (2024)",
     "type": NodeType.PAPER, "desc": "Google DeepMind Gemini 技术报告，原生多模态架构", "pop": 88},
]

# ============================================================
# === 新增 Benchmarks
# ============================================================
BENCHMARKS = [
    {"id": "swe-bench-pro", "name": "SWE-Bench Pro", "type": NodeType.BENCHMARK,
     "desc": "SWE-bench 的长时间跨度升级版，更真实的企业级代码修复", "pop": 78},
    {"id": "terminal-bench", "name": "Terminal-Bench", "type": NodeType.BENCHMARK,
     "desc": "终端环境 AI Agent 基准，评估命令行操作和系统管理能力", "pop": 72},
    {"id": "gaia2-bench", "name": "Gaia2", "type": NodeType.BENCHMARK,
     "desc": "动态异步环境 Agent 评估，GPT-4o/Claude 完成率下降 40%+", "pop": 80},
    {"id": "the-agent-company", "name": "TheAgentCompany", "type": NodeType.BENCHMARK,
     "desc": "真实办公场景 Agent 任务评估，模拟职场多步骤工作流", "pop": 75},
    {"id": "mcp-bench", "name": "MCP-Bench", "type": NodeType.BENCHMARK,
     "desc": "基于 MCP 协议的工具使用能力评估", "pop": 70},
    {"id": "dsa-eval", "name": "DSAEval", "type": NodeType.BENCHMARK,
     "desc": "641 个真实数据科学问题的 Agent 评估，含视觉与文本", "pop": 68},
    {"id": "ml-e-bench", "name": "MLE-Bench", "type": NodeType.BENCHMARK,
     "desc": "机器学习工程 Agent 能力评估，覆盖 ML 全流程", "pop": 72},
    {"id": "deepweb-bench", "name": "DeepWeb-Bench", "type": NodeType.BENCHMARK,
     "desc": "深度研究 Agent 评估：跨源长链推理和信息综合", "pop": 65},
    {"id": "browscomp", "name": "BrowsComp", "type": NodeType.BENCHMARK,
     "desc": "网页浏览 Agent 的困难基准，含复杂交互和多步导航", "pop": 68},
    {"id": "sec-bench", "name": "SEC-Bench", "type": NodeType.BENCHMARK,
     "desc": "真实软件安全任务的 Agent 评估基准", "pop": 65},
    {"id": "live-bench", "name": "LiveCodeBench", "type": NodeType.BENCHMARK,
     "desc": "基于最新竞赛题目的代码能力实时评估，防止数据污染", "pop": 75},
    {"id": "aider-bench", "name": "Aider Polyglot Bench", "type": NodeType.BENCHMARK,
     "desc": "多语言代码编辑能力评测，Aider 团队的标准化测试集", "pop": 78},
]

# ============================================================
# === 新增 Products / Tools
# ============================================================
PRODUCTS = [
    {"id": "github-copilot", "name": "GitHub Copilot", "type": NodeType.PRODUCT,
     "desc": "GitHub/Microsoft 的 AI 编程助手，支持多模型（GPT-4o/Claude/Gemini）", "pop": 93},
    {"id": "windsurf", "name": "Windsurf", "type": NodeType.PRODUCT,
     "desc": "Cognition AI 收购的 AI IDE，Cascade 深度上下文理解", "pop": 78},
    {"id": "codex-cli", "name": "Codex CLI", "type": NodeType.PRODUCT,
     "desc": "OpenAI 的开源终端编程 Agent，支持沙箱执行模式", "pop": 80},
    {"id": "gemini-cli", "name": "Gemini CLI", "type": NodeType.PRODUCT,
     "desc": "Google 开源终端 AI Agent，100 万 Token 上下文，集成搜索", "pop": 75},
    {"id": "aider", "name": "Aider", "type": NodeType.PRODUCT,
     "desc": "终端 AI 结对编程工具，支持多模型和自动 commit", "pop": 82},
    {"id": "cline", "name": "Cline", "type": NodeType.PRODUCT,
     "desc": "VS Code 自主 Agent 插件，支持浏览器自动化和终端操作", "pop": 80},
    {"id": "openhands", "name": "OpenHands", "type": NodeType.PRODUCT,
     "desc": "开源自主编程 Agent 平台，支持 Web 操作和 API 调用", "pop": 78},
    {"id": "lovable", "name": "Lovable", "type": NodeType.PRODUCT,
     "desc": "AI 全栈应用构建平台，自然语言生成生产级 Web 应用", "pop": 75},
    {"id": "bolt", "name": "Bolt AI", "type": NodeType.PRODUCT,
     "desc": "浏览器内 AI 全栈应用生成器，支持即时预览和部署", "pop": 72},
    {"id": "gpt-researcher", "name": "GPT Researcher", "type": NodeType.PRODUCT,
     "desc": "开源自主研究 Agent，自动搜索-提取-综合生成研究报告", "pop": 78},
    {"id": "browser-use", "name": "Browser Use", "type": NodeType.PRODUCT,
     "desc": "开源浏览器自动化 Agent 框架，支持多标签页复杂操作", "pop": 75},
    {"id": "mem0", "name": "Mem0", "type": NodeType.PRODUCT,
     "desc": "开源 LLM 记忆层，自动从对话中提取和检索关键信息", "pop": 72},
    {"id": "letta", "name": "Letta (MemGPT)", "type": NodeType.PRODUCT,
     "desc": "具备自主记忆管理的 Agent 框架，支持长期对话上下文", "pop": 76},
    {"id": "n8n", "name": "n8n", "type": NodeType.PRODUCT,
     "desc": "开源工作流自动化平台，AI Agent 节点支持多模型编排", "pop": 82},
    {"id": "kimi", "name": "Kimi", "type": NodeType.PRODUCT,
     "desc": "月之暗面的旗舰 AI 助手，支持超长上下文和深度推理", "pop": 83},
    {"id": "doubao", "name": "豆包 (Doubao)", "type": NodeType.PRODUCT,
     "desc": "字节跳动 AI 助手，中国最流行的 C 端 AI 应用之一", "pop": 85},
    {"id": "tongyi", "name": "通义千问", "type": NodeType.PRODUCT,
     "desc": "阿里云 AI 助手，企业级 AI 平台，集成办公协作", "pop": 82},
    {"id": "baidu-ernie", "name": "文心一言", "type": NodeType.PRODUCT,
     "desc": "百度 AI 助手，基于 ERNIE 系列模型", "pop": 80},
]

# ============================================================
# === 新增 Agent Frameworks
# ============================================================
AGENT_FRAMEWORKS = [
    {"id": "pydantic-ai", "name": "Pydantic AI", "type": NodeType.AGENT_FRAMEWORK,
     "desc": "类型安全的 Agent 开发框架，多提供商支持，严格输出 Schema 验证", "pop": 85},
    {"id": "llamaindex", "name": "LlamaIndex", "type": NodeType.AGENT_FRAMEWORK,
     "desc": "RAG 和数据 Agent 框架，专注文档检索和知识增强 Agent", "pop": 82},
    {"id": "mastra", "name": "Mastra", "type": NodeType.AGENT_FRAMEWORK,
     "desc": "TypeScript 原生 Agent 框架，内置工作流引擎和评估系统", "pop": 70},
    {"id": "smolagents", "name": "smolagents", "type": NodeType.AGENT_FRAMEWORK,
     "desc": "HuggingFace 开源轻量级 Agent 框架，代码驱动，最小化抽象", "pop": 72},
    {"id": "swarm", "name": "Swarm (OpenAI)", "type": NodeType.AGENT_FRAMEWORK,
     "desc": "OpenAI 教育性 Agent 框架，<500 行代码，示范 handoff 和 routing 模式", "pop": 78},
    {"id": "adk", "name": "Google Agent Development Kit", "type": NodeType.AGENT_FRAMEWORK,
     "desc": "Google 官方 Agent 开发套件，A2A 协议原生支持", "pop": 75},
    {"id": "semantic-kernel", "name": "Semantic Kernel", "type": NodeType.AGENT_FRAMEWORK,
     "desc": "微软企业级 AI 编排 SDK，C#/Python/Java 多语言支持", "pop": 80},
]

# ============================================================
# === 新增 Technologies
# ============================================================
TECHNOLOGIES = [
    {"id": "a2a-protocol", "name": "A2A 协议", "type": NodeType.TECHNOLOGY,
     "desc": "Google 提出的 Agent-to-Agent 协议，标准化 Agent 间通信", "pop": 78},
    {"id": "tool-use", "name": "工具使用", "type": NodeType.TECHNOLOGY,
     "desc": "LLM 调用外部 API/函数的能力，Agent 自主行动的核心基础", "pop": 85},
    {"id": "ai-coding", "name": "AI 辅助编程", "type": NodeType.TECHNOLOGY,
     "desc": "AI 驱动的代码生成、审查、调试和重构，从 Copilot 到自主 Agent", "pop": 92},
    {"id": "context-engineering", "name": "上下文工程", "type": NodeType.TECHNOLOGY,
     "desc": "系统性管理 LLM 上下文窗口的技术，包括压缩、缓存和选择", "pop": 78},
    {"id": "prompt-caching", "name": "Prompt 缓存", "type": NodeType.TECHNOLOGY,
     "desc": "重用之前计算的内容以减少延迟和成本的优化技术", "pop": 75},
    {"id": "structured-output", "name": "结构化输出", "type": NodeType.TECHNOLOGY,
     "desc": "让 LLM 按指定 JSON Schema 生成输出的技术，函数调用基础", "pop": 82},
    {"id": "speculative-decoding", "name": "推测解码", "type": NodeType.TECHNOLOGY,
     "desc": "用小模型草稿+大模型验证加速推理，2-3× 速度提升", "pop": 72},
]

# ============================================================
# === Insert All Nodes ======================================
# ============================================================
ALL_NEW = PAPERS + BENCHMARKS + PRODUCTS + AGENT_FRAMEWORKS + TECHNOLOGIES

print(f"Inserting {len(ALL_NEW)} new nodes...")
for item in ALL_NEW:
    node = GraphNode(
        id=item["id"],
        name=item["name"],
        node_type=item["type"],
        description=item["desc"],
        summary_zh=item["desc"],
        popularity=item["pop"],
        first_seen=now,
        last_updated=now,
    )
    repo.upsert_node(node)
    print(f"  ✓ [{item['type'].value}] {item['name']}")

# ============================================================
# === New Relationships =====================================
# ============================================================
NEW_EDGES = [
    # Papers → Core tech
    ("paper-attention", "transformer", RelationType.PROPOSED_BY),
    ("paper-lora", "lora", RelationType.PROPOSED_BY),
    ("paper-dpo", "dpo", RelationType.PROPOSED_BY),
    ("paper-rlhf", "rlhf", RelationType.PROPOSED_BY),
    ("paper-rag", "rag", RelationType.PROPOSED_BY),
    ("paper-moe", "moe-architecture", RelationType.PROPOSED_BY),
    ("paper-graphrag", "graphrag", RelationType.PROPOSED_BY),
    ("paper-vllm", "vllm", RelationType.PROPOSED_BY),
    ("paper-qlora", "qlora", RelationType.PROPOSED_BY),
    ("paper-grpo", "grpo", RelationType.PROPOSED_BY),
    ("paper-mcp", "mcp-protocol", RelationType.PROPOSED_BY),
    ("paper-swe-bench", "swe-bench", RelationType.PROPOSED_BY),
    ("paper-gaia2", "gaia2-bench", RelationType.PROPOSED_BY),
    ("paper-agent-survey", "agentic-ai", RelationType.BASED_ON),

    # Papers → Companies
    ("paper-llama", "meta-ai", RelationType.RELEASED),
    ("paper-deepseek-v4", "deepseek", RelationType.RELEASED),
    ("paper-qwen3", "alibaba", RelationType.RELEASED),
    ("paper-multimodal", "google-deepmind", RelationType.RELEASED),

    # Papers → Models
    ("paper-llama", "llama-4", RelationType.PROPOSED_BY),
    ("paper-deepseek-v4", "deepseek-v4", RelationType.PROPOSED_BY),
    ("paper-qwen3", "qwen-3", RelationType.PROPOSED_BY),
    ("paper-multimodal", "gemini-3", RelationType.PROPOSED_BY),

    # New Products → Companies
    ("github-copilot", "openai", RelationType.BASED_ON),
    ("codex-cli", "openai", RelationType.BELONGS_TO),
    ("gemini-cli", "google-deepmind", RelationType.BELONGS_TO),
    ("kimi", "moonshot", RelationType.BELONGS_TO),
    ("doubao", "openai", RelationType.COMPETES_WITH),
    ("tongyi", "alibaba", RelationType.BELONGS_TO),
    ("baidu-ernie", "openai", RelationType.COMPETES_WITH),
    ("windsurf", "cursor", RelationType.COMPETES_WITH),

    # Products → Agents
    ("github-copilot", "code-agent", RelationType.CATEGORY_OF),
    ("codex-cli", "code-agent", RelationType.CATEGORY_OF),
    ("gemini-cli", "code-agent", RelationType.CATEGORY_OF),
    ("aider", "code-agent", RelationType.CATEGORY_OF),
    ("cline", "code-agent", RelationType.CATEGORY_OF),
    ("openhands", "code-agent", RelationType.CATEGORY_OF),
    ("gpt-researcher", "autonomous-agent", RelationType.CATEGORY_OF),
    ("browser-use", "browser-agent", RelationType.CATEGORY_OF),
    ("mem0", "autonomous-agent", RelationType.BASED_ON),
    ("letta", "autonomous-agent", RelationType.BASED_ON),

    # New Frameworks → Tech
    ("pydantic-ai", "structured-output", RelationType.BASED_ON),
    ("pydantic-ai", "agentic-ai", RelationType.BASED_ON),
    ("llamaindex", "rag", RelationType.BASED_ON),
    ("llamaindex", "agentic-ai", RelationType.BASED_ON),
    ("mastra", "agentic-ai", RelationType.BASED_ON),
    ("smolagents", "agentic-ai", RelationType.BASED_ON),
    ("swarm", "agentic-ai", RelationType.BASED_ON),
    ("adk", "a2a-protocol", RelationType.BASED_ON),
    ("adk", "agentic-ai", RelationType.BASED_ON),
    ("semantic-kernel", "agentic-ai", RelationType.BASED_ON),
    ("semantic-kernel", "function-calling", RelationType.BASED_ON),

    # Benchmarks → Evaluated
    ("swe-bench-pro", "swe-bench", RelationType.IMPROVES),
    ("terminal-bench", "code-agent", RelationType.EVALUATED_BY),
    ("the-agent-company", "autonomous-agent", RelationType.EVALUATED_BY),
    ("mcp-bench", "mcp-protocol", RelationType.EVALUATED_BY),
    ("dsa-eval", "multimodal", RelationType.EVALUATED_BY),
    ("ml-e-bench", "agentic-ai", RelationType.EVALUATED_BY),
    ("deepweb-bench", "autonomous-agent", RelationType.EVALUATED_BY),
    ("browscomp", "browser-agent", RelationType.EVALUATED_BY),
    ("gaia2-bench", "gaia", RelationType.IMPROVES),
    ("live-bench", "humaneval", RelationType.IMPROVES),
    ("aider-bench", "code-agent", RelationType.EVALUATED_BY),

    # Technologies
    ("a2a-protocol", "mcp-protocol", RelationType.COMPETES_WITH),
    ("tool-use", "function-calling", RelationType.CATEGORY_OF),
    ("ai-coding", "code-agent", RelationType.BASED_ON),
    ("ai-coding", "agentic-ai", RelationType.CATEGORY_OF),
    ("context-engineering", "long-context", RelationType.IMPROVES),
    ("prompt-caching", "context-engineering", RelationType.BASED_ON),
    ("structured-output", "function-calling", RelationType.IMPROVES),
    ("speculative-decoding", "vllm", RelationType.BASED_ON),

    # Competitions between products
    ("claude-code", "github-copilot", RelationType.COMPETES_WITH),
    ("codex-cli", "claude-code", RelationType.COMPETES_WITH),
    ("gemini-cli", "codex-cli", RelationType.COMPETES_WITH),
    ("lovable", "bolt", RelationType.COMPETES_WITH),
    ("kimi", "doubao", RelationType.COMPETES_WITH),
]

print(f"\nAdding {len(NEW_EDGES)} new relationships...")
for src, tgt, rel in NEW_EDGES:
    edge = GraphEdge(source_id=src, target_id=tgt, relation=rel)
    try:
        repo.upsert_edge(edge)
        print(f"  ✓ {src} --[{rel.value}]--> {tgt}")
    except Exception as e:
        print(f"  ✗ {src} --[{rel.value}]--> {tgt}  ({e})")

print(f"\n✅ Enhancement complete! +{len(PAPERS)} papers, +{len(BENCHMARKS)} benchmarks, "
      f"+{len(PRODUCTS)} products, +{len(AGENT_FRAMEWORKS)} frameworks, +{len(TECHNOLOGIES)} techs, "
      f"+{len(NEW_EDGES)} relationships.")
driver.close()
