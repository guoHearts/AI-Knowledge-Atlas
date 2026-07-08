export const ROADMAP = [
  {
    layer: '01',
    title: 'Agent 基础层',
    eyebrow: 'Concepts',
    description: '先看懂 Agent、工具调用、MCP、设计模式和多 Agent 协作。',
    modules: '模块 1-5',
    accent: 'bg-stellar-blue',
  },
  {
    layer: '02',
    title: '生产工程层',
    eyebrow: 'Production',
    description: '补齐可观测性、错误处理、安全防护、RAG、微调和推理优化。',
    modules: '模块 6-10',
    accent: 'bg-stellar-emerald',
  },
  {
    layer: '03',
    title: '平台治理层',
    eyebrow: 'Platform',
    description: '用 Agents SDK、LangGraph、MCP 治理、评测流水线把 Demo 变成系统。',
    modules: '模块 11',
    accent: 'bg-stellar-violet',
  },
  {
    layer: '04',
    title: '产品形态层',
    eyebrow: 'Product',
    description: '进入实时语音、多模态文档、编程 Agent、合成数据与蒸馏。',
    modules: '模块 12',
    accent: 'bg-stellar-rose',
  },
] as const;

export const NEXT_STEPS = [
  '把图谱检索升级为 GraphRAG：实体、关系、社区摘要、Local / Global 查询。',
  '加入向量索引与混合检索：全文搜索、embedding、rerank 组成完整检索链。',
  '为 Agent 增加运行态：session、checkpoint、人工审批、任务恢复。',
  '建立评测闭环：测试集、打分器、回归门禁、trace 观测。',
  '增加可信度字段：来源、发布时间、置信度、最后验证时间。',
] as const;
