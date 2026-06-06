"""Seed the knowledge graph with ~50 core AI entities and relationships.
Run once after first setup: docker compose exec backend python scripts/seed_data.py
"""

import os
import sys
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

# === Seed nodes ===
SEED_NODES = [
    # Technologies
    {"id": "transformer", "name": "Transformer", "type": NodeType.TECHNOLOGY, "desc": "基于自注意力机制的神经网络架构，现代LLM的基础", "pop": 95},
    {"id": "mcp-protocol", "name": "MCP 协议", "type": NodeType.TECHNOLOGY, "desc": "Model Context Protocol，AI 模型与外部工具/数据源交互的标准协议", "pop": 90},
    {"id": "rag", "name": "RAG (检索增强生成)", "type": NodeType.TECHNOLOGY, "desc": "Retrieval-Augmented Generation，结合外部知识检索增强LLM回答质量", "pop": 85},
    {"id": "agentic-ai", "name": "Agentic AI", "type": NodeType.TECHNOLOGY, "desc": "具备自主决策、规划和工具使用能力的AI系统", "pop": 92},
    {"id": "graphrag", "name": "GraphRAG", "type": NodeType.TECHNOLOGY, "desc": "基于知识图谱的RAG方法，利用图结构增强检索的上下文关联性", "pop": 75},
    {"id": "moe-architecture", "name": "MoE 架构", "type": NodeType.TECHNOLOGY, "desc": "Mixture of Experts，稀疏激活的模型架构，提高效率的同时保持性能", "pop": 80},
    {"id": "chain-of-thought", "name": "思维链推理", "type": NodeType.TECHNOLOGY, "desc": "Chain-of-Thought，让模型逐步推理以提高复杂问题解决能力", "pop": 88},
    {"id": "function-calling", "name": "Function Calling", "type": NodeType.TECHNOLOGY, "desc": "LLM 调用外部函数/API 的能力，Agent 的核心基础", "pop": 82},
    {"id": "rlhf", "name": "RLHF", "type": NodeType.TECHNOLOGY, "desc": "Reinforcement Learning from Human Feedback，基于人类反馈的强化学习", "pop": 78},
    {"id": "synthetic-data", "name": "合成数据", "type": NodeType.TECHNOLOGY, "desc": "使用AI生成训练数据，解决数据稀缺和质量问题", "pop": 70},
    {"id": "long-context", "name": "长上下文", "type": NodeType.TECHNOLOGY, "desc": "支持超长上下文窗口（100K-1M tokens）的技术", "pop": 85},
    {"id": "quantization", "name": "量化部署", "type": NodeType.TECHNOLOGY, "desc": "模型量化压缩技术（INT4/INT8），降低推理成本和硬件门槛", "pop": 72},
    {"id": "multimodal", "name": "多模态", "type": NodeType.TECHNOLOGY, "desc": "融合文本、图像、视频、音频等多种模态的AI技术", "pop": 88},

    # Models
    {"id": "gpt-5", "name": "GPT-5", "type": NodeType.MODEL, "desc": "OpenAI 最新旗舰大模型", "pop": 95},
    {"id": "claude-opus-4-8", "name": "Claude Opus 4.8", "type": NodeType.MODEL, "desc": "Anthropic 最新旗舰模型，擅长推理和代码", "pop": 93},
    {"id": "gemini-3", "name": "Gemini 3", "type": NodeType.MODEL, "desc": "Google DeepMind 最新多模态大模型", "pop": 88},
    {"id": "deepseek-v4", "name": "DeepSeek-V4", "type": NodeType.MODEL, "desc": "深度求索最新开源大模型", "pop": 90},
    {"id": "llama-4", "name": "Llama 4", "type": NodeType.MODEL, "desc": "Meta 最新开源大模型系列", "pop": 85},
    {"id": "qwen-3", "name": "Qwen 3", "type": NodeType.MODEL, "desc": "阿里通义千问最新模型", "pop": 82},
    {"id": "grok-3", "name": "Grok-3", "type": NodeType.MODEL, "desc": "xAI 最新模型", "pop": 78},

    # Products
    {"id": "chatgpt", "name": "ChatGPT", "type": NodeType.PRODUCT, "desc": "OpenAI 的旗舰 AI 聊天产品", "pop": 98},
    {"id": "claude-code", "name": "Claude Code", "type": NodeType.PRODUCT, "desc": "Anthropic 的 AI 编程助手 CLI 工具", "pop": 88},
    {"id": "cursor", "name": "Cursor", "type": NodeType.PRODUCT, "desc": "AI-first 代码编辑器", "pop": 85},
    {"id": "perplexity", "name": "Perplexity", "type": NodeType.PRODUCT, "desc": "AI 驱动的搜索引擎", "pop": 82},
    {"id": "devin", "name": "Devin", "type": NodeType.PRODUCT, "desc": "Cognition AI 的自主编程 Agent", "pop": 80},

    # Agent Frameworks
    {"id": "langchain", "name": "LangChain", "type": NodeType.AGENT_FRAMEWORK, "desc": "最流行的 LLM 应用开发框架", "pop": 92},
    {"id": "crewai", "name": "CrewAI", "type": NodeType.AGENT_FRAMEWORK, "desc": "多智能体协作框架", "pop": 80},
    {"id": "autogen", "name": "AutoGen", "type": NodeType.AGENT_FRAMEWORK, "desc": "微软的多智能体对话框架", "pop": 78},
    {"id": "openai-agents-sdk", "name": "OpenAI Agents SDK", "type": NodeType.AGENT_FRAMEWORK, "desc": "OpenAI 官方 Agent 开发 SDK", "pop": 83},
    {"id": "anthropic-agent-sdk", "name": "Anthropic Agent SDK", "type": NodeType.AGENT_FRAMEWORK, "desc": "Anthropic 官方 Agent 开发 SDK", "pop": 81},
    {"id": "dify", "name": "Dify", "type": NodeType.AGENT_FRAMEWORK, "desc": "开源 LLM 应用开发平台", "pop": 76},
    {"id": "coze", "name": "Coze", "type": NodeType.AGENT_FRAMEWORK, "desc": "字节跳动 AI Bot 开发平台", "pop": 75},

    # Agent Types
    {"id": "autonomous-agent", "name": "自主 Agent", "type": NodeType.AGENT_TYPE, "desc": "能自主规划、决策和执行任务的AI系统", "pop": 88},
    {"id": "multi-agent", "name": "多智能体协作", "type": NodeType.AGENT_TYPE, "desc": "多个Agent协同工作的范式", "pop": 83},
    {"id": "code-agent", "name": "代码 Agent", "type": NodeType.AGENT_TYPE, "desc": "专注于代码生成和软件工程的Agent", "pop": 86},
    {"id": "browser-agent", "name": "浏览器 Agent", "type": NodeType.AGENT_TYPE, "desc": "操控浏览器完成Web任务的Agent", "pop": 72},
    {"id": "workflow-agent", "name": "工作流 Agent", "type": NodeType.AGENT_TYPE, "desc": "按预定义工作流执行的Agent", "pop": 75},

    # Companies
    {"id": "openai", "name": "OpenAI", "type": NodeType.COMPANY, "desc": "全球领先的AI研究公司", "pop": 98},
    {"id": "anthropic", "name": "Anthropic", "type": NodeType.COMPANY, "desc": "专注于AI安全的AI研究公司", "pop": 95},
    {"id": "google-deepmind", "name": "Google DeepMind", "type": NodeType.COMPANY, "desc": "Google旗下的AI研究机构", "pop": 93},
    {"id": "meta-ai", "name": "Meta AI", "type": NodeType.COMPANY, "desc": "Meta的AI研究部门", "pop": 88},
    {"id": "deepseek", "name": "深度求索", "type": NodeType.COMPANY, "desc": "中国领先的AI大模型公司", "pop": 90},
    {"id": "zhipu", "name": "智谱AI", "type": NodeType.COMPANY, "desc": "清华系AI公司，开发GLM系列模型", "pop": 82},
    {"id": "moonshot", "name": "月之暗面", "type": NodeType.COMPANY, "desc": "中国AI大模型创业公司，Kimi的开发者", "pop": 80},
    {"id": "alibaba", "name": "阿里云", "type": NodeType.COMPANY, "desc": "阿里巴巴旗下云计算与AI平台，通义千问系列的开发者", "pop": 88},

    # Benchmarks
    {"id": "swe-bench", "name": "SWE-bench", "type": NodeType.BENCHMARK, "desc": "软件工程任务评测基准", "pop": 85},
    {"id": "mmlu", "name": "MMLU", "type": NodeType.BENCHMARK, "desc": "多任务语言理解评测", "pop": 82},
    {"id": "humaneval", "name": "HumanEval", "type": NodeType.BENCHMARK, "desc": "代码生成能力评测", "pop": 80},
    {"id": "gaia", "name": "GAIA", "type": NodeType.BENCHMARK, "desc": "通用AI助手评测基准", "pop": 70},
    {"id": "webarena", "name": "WebArena", "type": NodeType.BENCHMARK, "desc": "Web环境下的Agent评测", "pop": 65},
]

# === Insert nodes ===
print("Inserting nodes...")
for item in SEED_NODES:
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
    print(f"  ✓ {item['name']}")

# === Seed relationships ===
SEED_EDGES = [
    ("gpt-5", "openai", RelationType.RELEASED),
    ("claude-opus-4-8", "anthropic", RelationType.RELEASED),
    ("gemini-3", "google-deepmind", RelationType.RELEASED),
    ("deepseek-v4", "deepseek", RelationType.RELEASED),
    ("llama-4", "meta-ai", RelationType.RELEASED),
    ("chatgpt", "openai", RelationType.BELONGS_TO),
    ("claude-code", "anthropic", RelationType.BELONGS_TO),
    ("gpt-5", "chatgpt", RelationType.POWERS),
    ("claude-opus-4-8", "claude-code", RelationType.POWERS),
    ("gpt-5", "transformer", RelationType.BASED_ON),
    ("claude-opus-4-8", "transformer", RelationType.BASED_ON),
    ("qwen-3", "alibaba", RelationType.RELEASED),
    ("qwen-3", "transformer", RelationType.BASED_ON),
    ("deepseek-v4", "moe-architecture", RelationType.BASED_ON),
    ("mcp-protocol", "anthropic", RelationType.PROPOSED_BY),
    ("agentic-ai", "function-calling", RelationType.BASED_ON),
    ("agentic-ai", "chain-of-thought", RelationType.BASED_ON),
    ("rag", "graphrag", RelationType.IMPROVES),
    ("langchain", "agentic-ai", RelationType.BASED_ON),
    ("crewai", "langchain", RelationType.BASED_ON),
    ("openai-agents-sdk", "openai", RelationType.BELONGS_TO),
    ("anthropic-agent-sdk", "anthropic", RelationType.BELONGS_TO),
    ("claude-code", "code-agent", RelationType.CATEGORY_OF),
    ("devin", "code-agent", RelationType.CATEGORY_OF),
    ("cursor", "code-agent", RelationType.CATEGORY_OF),
    ("code-agent", "swe-bench", RelationType.EVALUATED_BY),
    ("claude-code", "cursor", RelationType.COMPETES_WITH),
    ("gpt-5", "claude-opus-4-8", RelationType.COMPETES_WITH),
    ("deepseek-v4", "gpt-5", RelationType.COMPETES_WITH),
    ("claude-code", "mcp-protocol", RelationType.BASED_ON),
    ("anthropic-agent-sdk", "mcp-protocol", RelationType.BASED_ON),
]

print(f"\nAdding {len(SEED_EDGES)} relationships...")
for src, tgt, rel in SEED_EDGES:
    edge = GraphEdge(source_id=src, target_id=tgt, relation=rel)
    repo.upsert_edge(edge)
    print(f"  ✓ {src} --[{rel.value}]--> {tgt}")

print(f"\n✅ Seed complete! {len(SEED_NODES)} nodes, {len(SEED_EDGES)} relationships.")
driver.close()
