-- Seed learning track with modules and lessons from existing MDX content.
-- Run: docker exec -i ai-knowledge-atlas-postgres-1 psql -U app -d ai_knowledge_atlas < this_file.sql

-- Track
insert into learning_tracks (id, slug, title, subtitle, description, difficulty, estimated_hours, outcome_skills, outcome_project, icon, sort_order, status)
values ('agent-engineer', 'agent-engineer', 'Agent Engineer',
        '从零到一构建生产级 AI Agent 系统',
        '覆盖 Agent 基础、工具使用、MCP 协议、设计模式、多智能体协作、生产部署、RAG、微调、推理优化、安全治理、平台工程和产品模式。',
        'intermediate', 120,
        '["独立设计并实现具备工具调用与多智能体协作的 Agent 系统","开发并部署符合 MCP 协议的 Server/Client 与安全边界","搭建带可观测性、错误处理与人工审批的生产级 Agent 服务","构建包含向量检索与重排序的混合 RAG 管线","建立评估闭环：测试集、评分器与回归门禁","完成 LoRA/QLoRA 微调与偏好对齐的实践闭环"]',
        '交付一个生产级 AI Agent 系统：从需求拆解、工具与 MCP 集成、RAG 检索、评估门禁到带人工审批的部署上线，形成可复现、可观测、可回归的完整工程闭环。',
        'agent', 1, 'published')
on conflict (id) do update set
  title = excluded.title,
  status = excluded.status,
  outcome_skills = excluded.outcome_skills,
  outcome_project = excluded.outcome_project;

-- Modules (1-12)
insert into modules (id, track_id, title, description, stage, sort_order, estimated_hours, difficulty, status)
values
  ('mod-01', 'agent-engineer', 'Agent 基础', '理解 AI Agent 的核心概念、生态系统和第一个 SDK 选择。', 1, 1, 8, 'beginner', 'published'),
  ('mod-02', 'agent-engineer', '工具使用', '深入 Function Calling、可复用工具设计和 Schema 最佳实践。', 1, 2, 10, 'beginner', 'published'),
  ('mod-03', 'agent-engineer', 'MCP 协议', '掌握 Model Context Protocol 的原理、Server/Client 开发与外部数据源集成。', 1, 3, 10, 'intermediate', 'published'),
  ('mod-04', 'agent-engineer', '设计模式', 'Pipeline、Router、Orchestrator-Worker 等 7 种核心 Agent 设计模式。', 2, 4, 12, 'intermediate', 'published'),
  ('mod-05', 'agent-engineer', '多智能体协作', 'Multi-Agent 协作模式、通信协议与工作流编排。', 2, 5, 10, 'intermediate', 'published'),
  ('mod-06', 'agent-engineer', '生产部署：可观测性', 'Agent 可观测性、错误处理与重试策略、安全防护。', 3, 6, 10, 'intermediate', 'published'),
  ('mod-07', 'agent-engineer', 'RAG 架构', '检索增强生成的架构设计、向量数据库选型与混合检索。', 3, 7, 10, 'intermediate', 'published'),
  ('mod-08', 'agent-engineer', '微调与对齐', 'LoRA/QLoRA 微调、DPO/GRPO 偏好对齐实践。', 3, 8, 10, 'advanced', 'published'),
  ('mod-09', 'agent-engineer', '推理优化', '推理引擎对比、LLM 可观测性、量化部署与 AI Gateway。', 4, 9, 10, 'advanced', 'published'),
  ('mod-10', 'agent-engineer', '安全与治理', '多层安全防护、红队测试、企业合规与多模态 Agent。', 4, 10, 10, 'advanced', 'published'),
  ('mod-11', 'agent-engineer', 'Agent 平台工程', 'OpenAI Agents SDK、LangGraph、MCP 工具市场和评估流水线。', 5, 11, 12, 'advanced', 'published'),
  ('mod-12', 'agent-engineer', 'AI 产品模式', '实时语音 Agent、多模态文档、编程 Agent 工作流和合成数据蒸馏。', 5, 12, 10, 'advanced', 'published')
on conflict (id) do update set title = excluded.title, status = excluded.status;

-- Lessons per module (sampled — key lessons from each module)
insert into lessons (id, module_id, title, slug, content_path, sort_order, difficulty, estimated_minutes, status)
values
  ('l-01-01', 'mod-01', '什么是 Agent', '01-what-is-agent', 'content/agent-engineer/module-01-foundation/01-what-is-agent.mdx', 1, 'beginner', 45, 'published'),
  ('l-01-02', 'mod-01', 'Agent 生态系统', '02-agent-ecosystem', 'content/agent-engineer/module-01-foundation/02-agent-ecosystem.mdx', 2, 'beginner', 45, 'published'),
  ('l-01-03', 'mod-01', '选择第一个 SDK', '03-choose-first-sdk', 'content/agent-engineer/module-01-foundation/03-choose-first-sdk.mdx', 3, 'beginner', 45, 'published'),
  ('l-02-01', 'mod-02', 'Function Calling 深入', '01-function-calling-deep-dive', 'content/agent-engineer/module-02-tool-use/01-function-calling-deep-dive.mdx', 1, 'beginner', 50, 'published'),
  ('l-02-02', 'mod-02', '设计可复用工具', '02-design-reusable-tools', 'content/agent-engineer/module-02-tool-use/02-design-reusable-tools.mdx', 2, 'beginner', 50, 'published'),
  ('l-02-03', 'mod-02', '工具 Schema 最佳实践', '03-tool-schema-best-practices', 'content/agent-engineer/module-02-tool-use/03-tool-schema-best-practices.mdx', 3, 'beginner', 45, 'published'),
  ('l-02-04', 'mod-02', '构建数据查询 Agent', '04-build-data-query-agent', 'content/agent-engineer/module-02-tool-use/04-build-data-query-agent.mdx', 4, 'beginner', 60, 'published'),
  ('l-03-01', 'mod-03', 'MCP 协议原理', '01-mcp-protocol-principles', 'content/agent-engineer/module-03-mcp/01-mcp-protocol-principles.mdx', 1, 'intermediate', 50, 'published'),
  ('l-03-02', 'mod-03', '构建 MCP Server', '02-build-mcp-server', 'content/agent-engineer/module-03-mcp/02-build-mcp-server.mdx', 2, 'intermediate', 60, 'published'),
  ('l-03-03', 'mod-03', 'MCP Client 集成', '03-mcp-client-integration', 'content/agent-engineer/module-03-mcp/03-mcp-client-integration.mdx', 3, 'intermediate', 50, 'published'),
  ('l-03-04', 'mod-03', 'MCP 外部数据源', '04-mcp-external-data-source', 'content/agent-engineer/module-03-mcp/04-mcp-external-data-source.mdx', 4, 'intermediate', 55, 'published'),
  ('l-04-01', 'mod-04', 'Pipeline 模式', '01-pipeline-pattern', 'content/agent-engineer/module-04-design-patterns/01-pipeline-pattern.mdx', 1, 'intermediate', 45, 'published'),
  ('l-04-02', 'mod-04', 'Router 模式', '02-router-pattern', 'content/agent-engineer/module-04-design-patterns/02-router-pattern.mdx', 2, 'intermediate', 45, 'published'),
  ('l-04-03', 'mod-04', 'Orchestrator-Worker 模式', '03-orchestrator-worker', 'content/agent-engineer/module-04-design-patterns/03-orchestrator-worker.mdx', 3, 'intermediate', 50, 'published'),
  ('l-04-04', 'mod-04', 'Fan-out/Fan-in 模式', '04-fan-out-fan-in', 'content/agent-engineer/module-04-design-patterns/04-fan-out-fan-in.mdx', 4, 'intermediate', 45, 'published'),
  ('l-04-05', 'mod-04', 'Human-in-the-loop 模式', '05-human-in-the-loop', 'content/agent-engineer/module-04-design-patterns/05-human-in-the-loop.mdx', 5, 'intermediate', 50, 'published'),
  ('l-04-06', 'mod-04', 'Self-healing 模式', '06-self-healing', 'content/agent-engineer/module-04-design-patterns/06-self-healing.mdx', 6, 'intermediate', 45, 'published'),
  ('l-04-07', 'mod-04', '组合模式', '07-combining-patterns', 'content/agent-engineer/module-04-design-patterns/07-combining-patterns.mdx', 7, 'intermediate', 50, 'published'),
  ('l-05-01', 'mod-05', '多智能体协作', '01-multi-agent-collaboration', 'content/agent-engineer/module-05-multi-agent/01-multi-agent-collaboration.mdx', 1, 'intermediate', 50, 'published'),
  ('l-05-02', 'mod-05', 'Agent 通信协议', '02-agent-communication', 'content/agent-engineer/module-05-multi-agent/02-agent-communication.mdx', 2, 'intermediate', 45, 'published'),
  ('l-05-03', 'mod-05', '工作流编排', '03-workflow-orchestration', 'content/agent-engineer/module-05-multi-agent/03-workflow-orchestration.mdx', 3, 'intermediate', 50, 'published'),
  ('l-05-04', 'mod-05', '客服系统实践', '04-customer-service-system', 'content/agent-engineer/module-05-multi-agent/04-customer-service-system.mdx', 4, 'intermediate', 60, 'published'),
  ('l-06-01', 'mod-06', 'Agent 可观测性', '01-agent-observability', 'content/agent-engineer/module-06-production/01-agent-observability.mdx', 1, 'intermediate', 50, 'published'),
  ('l-06-02', 'mod-06', '错误处理与重试', '02-error-handling-retry', 'content/agent-engineer/module-06-production/02-error-handling-retry.mdx', 2, 'intermediate', 45, 'published'),
  ('l-06-03', 'mod-06', '安全与 Prompt 注入防护', '03-security-prompt-injection', 'content/agent-engineer/module-06-production/03-security-prompt-injection.mdx', 3, 'intermediate', 50, 'published'),
  ('l-07-01', 'mod-07', 'RAG 架构设计', '01-rag-architecture', 'content/agent-engineer/module-07-production/01-rag-architecture.mdx', 1, 'intermediate', 50, 'published'),
  ('l-07-02', 'mod-07', '向量数据库选型', '02-vector-database-selection', 'content/agent-engineer/module-07-production/02-vector-database-selection.mdx', 2, 'intermediate', 45, 'published'),
  ('l-07-03', 'mod-07', '混合检索', '03-hybrid-retrieval', 'content/agent-engineer/module-07-production/03-hybrid-retrieval.mdx', 3, 'intermediate', 50, 'published'),
  ('l-07-04', 'mod-07', 'Agentic RAG', '04-agentic-rag', 'content/agent-engineer/module-07-production/04-agentic-rag.mdx', 4, 'intermediate', 55, 'published'),
  ('l-08-01', 'mod-08', '微调概览', '01-fine-tuning-overview', 'content/agent-engineer/module-08-production/01-fine-tuning-overview.mdx', 1, 'advanced', 50, 'published'),
  ('l-08-02', 'mod-08', 'LoRA/QLoRA 实践', '02-lora-qlora-practice', 'content/agent-engineer/module-08-production/02-lora-qlora-practice.mdx', 2, 'advanced', 60, 'published'),
  ('l-08-03', 'mod-08', '偏好对齐 DPO/GRPO', '03-preference-alignment-dpo-grpo', 'content/agent-engineer/module-08-production/03-preference-alignment-dpo-grpo.mdx', 3, 'advanced', 50, 'published'),
  ('l-08-04', 'mod-08', '微调流水线', '04-fine-tuning-pipeline', 'content/agent-engineer/module-08-production/04-fine-tuning-pipeline.mdx', 4, 'advanced', 55, 'published'),
  ('l-09-01', 'mod-09', '推理引擎对比', '01-inference-engines-comparison', 'content/agent-engineer/module-09-production/01-inference-engines-comparison.mdx', 1, 'advanced', 50, 'published'),
  ('l-09-02', 'mod-09', 'LLM 可观测性', '02-llm-observability', 'content/agent-engineer/module-09-production/02-llm-observability.mdx', 2, 'advanced', 45, 'published'),
  ('l-09-03', 'mod-09', '量化部署', '03-quantization-deployment', 'content/agent-engineer/module-09-production/03-quantization-deployment.mdx', 3, 'advanced', 50, 'published'),
  ('l-09-04', 'mod-09', 'AI Gateway 缓存', '04-ai-gateway-caching', 'content/agent-engineer/module-09-production/04-ai-gateway-caching.mdx', 4, 'advanced', 50, 'published'),
  ('l-10-01', 'mod-10', '多层安全防护', '01-multi-layer-safety', 'content/agent-engineer/module-10-production/01-multi-layer-safety.mdx', 1, 'advanced', 50, 'published'),
  ('l-10-02', 'mod-10', '红队评估', '02-red-teaming-assessment', 'content/agent-engineer/module-10-production/02-red-teaming-assessment.mdx', 2, 'advanced', 45, 'published'),
  ('l-10-03', 'mod-10', '多模态 Agent 入门', '03-multimodal-agent-intro', 'content/agent-engineer/module-10-production/03-multimodal-agent-intro.mdx', 3, 'advanced', 50, 'published'),
  ('l-10-04', 'mod-10', '企业合规治理', '04-enterprise-compliance-governance', 'content/agent-engineer/module-10-production/04-enterprise-compliance-governance.mdx', 4, 'advanced', 50, 'published'),
  ('l-11-01', 'mod-11', 'OpenAI Agents SDK', '01-openai-agents-sdk-handoffs-tracing', 'content/agent-engineer/module-11-agent-platform/01-openai-agents-sdk-handoffs-tracing.mdx', 1, 'advanced', 55, 'published'),
  ('l-11-02', 'mod-11', 'LangGraph 持久化 Human Loop', '02-langgraph-durable-human-loop', 'content/agent-engineer/module-11-agent-platform/02-langgraph-durable-human-loop.mdx', 2, 'advanced', 55, 'published'),
  ('l-11-03', 'mod-11', 'MCP 工具市场治理', '03-mcp-tool-marketplace-governance', 'content/agent-engineer/module-11-agent-platform/03-mcp-tool-marketplace-governance.mdx', 3, 'advanced', 50, 'published'),
  ('l-11-04', 'mod-11', 'Agent 评估回归流水线', '04-agent-evals-regression-pipeline', 'content/agent-engineer/module-11-agent-platform/04-agent-evals-regression-pipeline.mdx', 4, 'advanced', 55, 'published'),
  ('l-12-01', 'mod-12', '实时语音 Agent 架构', '01-realtime-voice-agent-architecture', 'content/agent-engineer/module-12-ai-product-patterns/01-realtime-voice-agent-architecture.mdx', 1, 'advanced', 50, 'published'),
  ('l-12-02', 'mod-12', '多模态文档 Agent', '02-multimodal-document-agent', 'content/agent-engineer/module-12-ai-product-patterns/02-multimodal-document-agent.mdx', 2, 'advanced', 50, 'published'),
  ('l-12-03', 'mod-12', '编程 Agent 任务工作流', '03-coding-agent-task-workflow', 'content/agent-engineer/module-12-ai-product-patterns/03-coding-agent-task-workflow.mdx', 3, 'advanced', 55, 'published'),
  ('l-12-04', 'mod-12', '合成数据蒸馏', '04-synthetic-data-distillation', 'content/agent-engineer/module-12-ai-product-patterns/04-synthetic-data-distillation.mdx', 4, 'advanced', 50, 'published')
on conflict (id) do update set title = excluded.title, status = excluded.status;
