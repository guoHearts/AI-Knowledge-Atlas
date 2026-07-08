"""Seed the knowledge graph with ~50 core AI entities and relationships.
Run once after first setup: python scripts/seed_data.py
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
    {"id": "gguf", "name": "GGUF 格式", "type": NodeType.TECHNOLOGY, "desc": "llama.cpp 的通用模型量化格式，CPU 推理标准，支持 INT4/INT8/FP16", "pop": 80},

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

    # === 新增：LLMOps / 可观测性 ===
    {"id": "langfuse", "name": "Langfuse", "type": NodeType.PRODUCT, "desc": "开源 LLM 可观测性平台，支持追踪、评估、Prompt 管理，已获 ClickHouse 收购", "pop": 85},
    {"id": "arize-phoenix", "name": "Arize Phoenix", "type": NodeType.PRODUCT, "desc": "基于 OpenTelemetry 的 LLM 可观测性工具，擅长 RAG 调试", "pop": 78},
    {"id": "langsmith", "name": "LangSmith", "type": NodeType.PRODUCT, "desc": "LangChain 官方 LLM 追踪与评估平台", "pop": 82},
    {"id": "otel-genai", "name": "OpenTelemetry GenAI", "type": NodeType.TECHNOLOGY, "desc": "面向生成式 AI 的 OpenTelemetry 语义约定标准，正在制定中", "pop": 70},

    # === 新增：推理引擎 ===
    {"id": "vllm", "name": "vLLM", "type": NodeType.TECHNOLOGY, "desc": "高吞吐量 LLM 推理引擎，PagedAttention + Continuous Batching，开源社区首选", "pop": 92},
    {"id": "tensorrt-llm", "name": "TensorRT-LLM", "type": NodeType.TECHNOLOGY, "desc": "NVIDIA 官方推理优化引擎，极致 GPU 性能，支持 FP8/INT4/NVFP4", "pop": 88},
    {"id": "sglang", "name": "SGLang", "type": NodeType.TECHNOLOGY, "desc": "新兴 LLM 推理框架，RadixAttention 共享前缀缓存，结构化生成", "pop": 75},
    {"id": "llamacpp", "name": "llama.cpp", "type": NodeType.TECHNOLOGY, "desc": "纯 C/C++ LLM 推理，GGUF 格式，CPU + 边缘设备推理首选", "pop": 85},
    {"id": "ollama", "name": "Ollama", "type": NodeType.PRODUCT, "desc": "一键本地运行开源大模型的桌面工具，基于 llama.cpp", "pop": 88},

    # === 新增：量化技术 ===
    {"id": "awq", "name": "AWQ 量化", "type": NodeType.TECHNOLOGY, "desc": "Activation-Aware Weight Quantization，INT4 量化方案，GPU 推理速度最优", "pop": 80},
    {"id": "gptq", "name": "GPTQ 量化", "type": NodeType.TECHNOLOGY, "desc": "Post-Training Quantization，快速 INT4 量化方案", "pop": 75},
    {"id": "fp8-training", "name": "FP8 训练/推理", "type": NodeType.TECHNOLOGY, "desc": "H100/B200 原生 FP8 精度，推理速度提升 30-50%，质量损失极低", "pop": 82},
    {"id": "nvfp4", "name": "NVFP4", "type": NodeType.TECHNOLOGY, "desc": "NVIDIA Blackwell 架构新精度格式，DeepSeek-R1 已实现全球最快推理", "pop": 70},

    # === 新增：微调技术 ===
    {"id": "lora", "name": "LoRA", "type": NodeType.TECHNOLOGY, "desc": "Low-Rank Adaptation，训练 0.1-1% 参数即可微调大模型，2026 年默认方案", "pop": 92},
    {"id": "qlora", "name": "QLoRA", "type": NodeType.TECHNOLOGY, "desc": "Quantized LoRA，4-bit 量化 + LoRA，单张消费级 GPU 可微调 70B 模型", "pop": 88},
    {"id": "dpo", "name": "DPO", "type": NodeType.TECHNOLOGY, "desc": "Direct Preference Optimization，无需奖励模型的偏好对齐方法，2026 年默认方案", "pop": 85},
    {"id": "grpo", "name": "GRPO", "type": NodeType.TECHNOLOGY, "desc": "Group Relative Policy Optimization，DeepSeek 提出的推理增强方法", "pop": 78},
    {"id": "unsloth", "name": "Unsloth", "type": NodeType.TECHNOLOGY, "desc": "开源微调加速库，QLoRA 速度提升 2-5×，VRAM 降低 50-70%", "pop": 80},

    # === 新增：向量数据库 ===
    {"id": "pgvector", "name": "pgvector", "type": NodeType.TECHNOLOGY, "desc": "PostgreSQL 向量扩展，统一事务型+向量检索数据层，2026 年企业 RAG 首选", "pop": 88},
    {"id": "pinecone", "name": "Pinecone", "type": NodeType.PRODUCT, "desc": "全托管向量数据库云服务，Serverless 架构", "pop": 82},
    {"id": "qdrant", "name": "Qdrant", "type": NodeType.PRODUCT, "desc": "Rust 编写的高性能向量数据库，支持量化索引和过滤", "pop": 78},
    {"id": "weaviate", "name": "Weaviate", "type": NodeType.PRODUCT, "desc": "开源 AI-Native 向量数据库，内置混合检索和多模态支持", "pop": 75},
    {"id": "milvus", "name": "Milvus", "type": NodeType.PRODUCT, "desc": "云原生向量数据库，十亿级向量检索，Zilliz 开源", "pop": 80},
    {"id": "hybrid-search", "name": "混合检索", "type": NodeType.TECHNOLOGY, "desc": "稠密向量 + 稀疏关键词 + 重排序的多阶段检索策略", "pop": 82},

    # === 新增：AI 安全 ===
    {"id": "prompt-injection-defense", "name": "Prompt 注入防御", "type": NodeType.TECHNOLOGY, "desc": "多层输入/输出护栏防御 Prompt 注入攻击，2026 年企业合规必选", "pop": 88},
    {"id": "llama-guard", "name": "Llama Guard", "type": NodeType.TECHNOLOGY, "desc": "Meta 开源内容安全分类模型，14 类安全检测，支持 CPU 推理", "pop": 80},
    {"id": "prompt-guard", "name": "Prompt Guard", "type": NodeType.TECHNOLOGY, "desc": "Meta 开源 Prompt 注入检测模型，86M 参数，CPU 毫秒级响应", "pop": 75},
    {"id": "bedrock-guardrails", "name": "Bedrock Guardrails", "type": NodeType.PRODUCT, "desc": "AWS 托管 AI 安全护栏服务，6 大默认策略 + 上下文接地检查", "pop": 78},
    {"id": "red-teaming", "name": "AI 红队测试", "type": NodeType.TECHNOLOGY, "desc": "持续对抗性测试 AI 系统的安全性，已纳入 CI/CD 流水线", "pop": 75},

    # === 新增：多模态 ===
    {"id": "nemotron-nano-omni", "name": "Nemotron 3 Nano Omni", "type": NodeType.MODEL, "desc": "NVIDIA 开源多模态模型，30B MoE，统一视觉+音频+语言，9× 效率提升", "pop": 85},
    {"id": "ernie-5", "name": "ERNIE 5.0", "type": NodeType.MODEL, "desc": "百度 2.4 万亿参数统一多模态基础模型，理解+生成一体化", "pop": 80},
    {"id": "computer-use-agent", "name": "计算机使用 Agent", "type": NodeType.AGENT_TYPE, "desc": "能理解和操控 GUI 界面的 Agent，1080p 实时导航", "pop": 80},

    # === 新增：AI Gateway / 路由 ===
    {"id": "ai-gateway", "name": "AI Gateway", "type": NodeType.TECHNOLOGY, "desc": "统一 LLM API 层，多模型路由、故障转移、集中化治理", "pop": 82},
    {"id": "semantic-caching", "name": "语义缓存", "type": NodeType.TECHNOLOGY, "desc": "基于语义相似度的 LLM 响应缓存，命中率 60-85%，延迟降低 96.9%", "pop": 80},
    {"id": "portkey", "name": "Portkey", "type": NodeType.PRODUCT, "desc": "AI Gateway 平台，多模型路由 + 网关 + 护栏一体化", "pop": 72},
    {"id": "helicone", "name": "Helicone", "type": NodeType.PRODUCT, "desc": "LLM 代理监控平台，一行代码接入，分钟级部署", "pop": 70},

    # === 新增：模型评估 ===
    {"id": "deepeval", "name": "DeepEval", "type": NodeType.PRODUCT, "desc": "开源 LLM 评估框架，支持 RAG 评估、幻觉检测、毒性检测", "pop": 75},
    {"id": "braintrust", "name": "Braintrust", "type": NodeType.PRODUCT, "desc": "LLM 评估与实验平台，支持 A/B 测试和回归检测", "pop": 70},
    {"id": "lm-eval-harness", "name": "lm-evaluation-harness", "type": NodeType.TECHNOLOGY, "desc": "EleutherAI 开源模型评测框架，200+ 标准评测任务", "pop": 78},

    # === 新增：Agent 框架补充 ===
    {"id": "langgraph", "name": "LangGraph", "type": NodeType.AGENT_FRAMEWORK, "desc": "LangChain 的有状态 Agent 编排框架，图结构+检查点+时间旅行调试", "pop": 88},
    {"id": "microsoft-agent-framework", "name": "Microsoft Agent Framework", "type": NodeType.AGENT_FRAMEWORK, "desc": "微软 AutoGen 的继任框架，Python+C# 双语言，Azure 原生部署", "pop": 72},
    {"id": "vercel-ai-sdk", "name": "Vercel AI SDK", "type": NodeType.AGENT_FRAMEWORK, "desc": "Vercel 官方 AI 开发 SDK，TypeScript 原生，支持流式生成和多框架", "pop": 82},

    # === 新增：企业平台 ===
    {"id": "nvidia-nim", "name": "NVIDIA NIM", "type": NodeType.PRODUCT, "desc": "NVIDIA 模型推理微服务，一键部署优化模型 API", "pop": 80},
    {"id": "databricks-mlflow", "name": "MLflow", "type": NodeType.PRODUCT, "desc": "开源 ML 生命周期管理平台，实验追踪+模型注册+部署", "pop": 85},
    {"id": "huggingface-tgi", "name": "HuggingFace TGI", "type": NodeType.TECHNOLOGY, "desc": "Text Generation Inference，HuggingFace 推理服务框架", "pop": 80},
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

    # === 新增关系：LLMOps ===
    ("langfuse", "otel-genai", RelationType.BASED_ON),
    ("arize-phoenix", "otel-genai", RelationType.BASED_ON),
    ("langsmith", "langchain", RelationType.BELONGS_TO),
    ("langsmith", "langgraph", RelationType.BASED_ON),

    # === 新增关系：推理引擎 ===
    ("vllm", "awq", RelationType.BASED_ON),
    ("vllm", "gptq", RelationType.BASED_ON),
    ("vllm", "fp8-training", RelationType.BASED_ON),
    ("tensorrt-llm", "nvfp4", RelationType.BASED_ON),
    ("tensorrt-llm", "fp8-training", RelationType.BASED_ON),
    ("sglang", "vllm", RelationType.COMPETES_WITH),
    ("llamacpp", "gguf", RelationType.BASED_ON),
    ("ollama", "llamacpp", RelationType.BASED_ON),

    # === 新增关系：量化 ===
    ("quantization", "awq", RelationType.IMPROVES),
    ("quantization", "gptq", RelationType.IMPROVES),
    ("quantization", "fp8-training", RelationType.IMPROVES),
    ("deepseek-v4", "nvfp4", RelationType.BASED_ON),

    # === 新增关系：微调 ===
    ("lora", "quantization", RelationType.CATEGORY_OF),
    ("qlora", "lora", RelationType.IMPROVES),
    ("qlora", "unsloth", RelationType.BASED_ON),
    ("dpo", "rlhf", RelationType.IMPROVES),
    ("grpo", "deepseek-v4", RelationType.BASED_ON),
    ("unsloth", "lora", RelationType.BASED_ON),

    # === 新增关系：向量数据库 ===
    ("rag", "pgvector", RelationType.BASED_ON),
    ("rag", "pinecone", RelationType.BASED_ON),
    ("rag", "hybrid-search", RelationType.BASED_ON),
    ("pgvector", "rag", RelationType.IMPROVES),
    ("pinecone", "pgvector", RelationType.COMPETES_WITH),
    ("qdrant", "pinecone", RelationType.COMPETES_WITH),
    ("graphrag", "rag", RelationType.IMPROVES),
    ("graphrag", "pgvector", RelationType.BASED_ON),

    # === 新增关系：AI 安全 ===
    ("prompt-injection-defense", "llama-guard", RelationType.BASED_ON),
    ("prompt-injection-defense", "prompt-guard", RelationType.BASED_ON),
    ("llama-guard", "meta-ai", RelationType.RELEASED),
    ("prompt-guard", "meta-ai", RelationType.RELEASED),
    ("bedrock-guardrails", "prompt-injection-defense", RelationType.BASED_ON),
    ("red-teaming", "prompt-injection-defense", RelationType.IMPROVES),

    # === 新增关系：多模态 ===
    ("nemotron-nano-omni", "multimodal", RelationType.BASED_ON),
    ("nemotron-nano-omni", "moe-architecture", RelationType.BASED_ON),
    ("ernie-5", "multimodal", RelationType.BASED_ON),
    ("computer-use-agent", "multimodal", RelationType.BASED_ON),
    ("computer-use-agent", "browser-agent", RelationType.CATEGORY_OF),

    # === 新增关系：AI Gateway ===
    ("ai-gateway", "semantic-caching", RelationType.BASED_ON),
    ("portkey", "ai-gateway", RelationType.CATEGORY_OF),
    ("helicone", "ai-gateway", RelationType.CATEGORY_OF),
    ("semantic-caching", "rag", RelationType.IMPROVES),

    # === 新增关系：评估 ===
    ("deepeval", "rag", RelationType.EVALUATED_BY),
    ("braintrust", "mmlu", RelationType.EVALUATED_BY),
    ("lm-eval-harness", "humaneval", RelationType.EVALUATED_BY),

    # === 新增关系：Agent 框架 ===
    ("langgraph", "langchain", RelationType.BELONGS_TO),
    ("langgraph", "agentic-ai", RelationType.BASED_ON),
    ("microsoft-agent-framework", "autogen", RelationType.IMPROVES),
    ("vercel-ai-sdk", "agentic-ai", RelationType.BASED_ON),

    # === 新增关系：企业平台 ===
    ("nvidia-nim", "tensorrt-llm", RelationType.BASED_ON),
    ("nvidia-nim", "vllm", RelationType.BASED_ON),
    ("huggingface-tgi", "llamacpp", RelationType.COMPETES_WITH),
    ("databricks-mlflow", "agentic-ai", RelationType.BASED_ON),
]

print(f"\nAdding {len(SEED_EDGES)} relationships...")
for src, tgt, rel in SEED_EDGES:
    edge = GraphEdge(source_id=src, target_id=tgt, relation=rel)
    repo.upsert_edge(edge)
    print(f"  ✓ {src} --[{rel.value}]--> {tgt}")

print(f"\n✅ Seed complete! {len(SEED_NODES)} nodes, {len(SEED_EDGES)} relationships.")
driver.close()
