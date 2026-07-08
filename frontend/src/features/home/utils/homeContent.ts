export const ROADMAP = [
  {
    layer: '01',
    title: 'Agent foundations',
    eyebrow: 'Concepts',
    description: 'Understand agents, tool use, MCP, design patterns, and multi-agent collaboration.',
    modules: 'Modules 1-5',
    accent: 'bg-stellar-blue',
  },
  {
    layer: '02',
    title: 'Production engineering',
    eyebrow: 'Production',
    description: 'Add observability, error handling, security, RAG, fine-tuning, and inference optimization.',
    modules: 'Modules 6-10',
    accent: 'bg-stellar-emerald',
  },
  {
    layer: '03',
    title: 'Platform governance',
    eyebrow: 'Platform',
    description: 'Turn demos into systems with SDKs, LangGraph, MCP governance, and evaluation pipelines.',
    modules: 'Module 11',
    accent: 'bg-stellar-violet',
  },
  {
    layer: '04',
    title: 'Product systems',
    eyebrow: 'Product',
    description: 'Explore voice, multimodal documents, coding agents, synthetic data, and deployment workflows.',
    modules: 'Module 12',
    accent: 'bg-stellar-rose',
  },
] as const;

export const NEXT_STEPS = [
  'Upgrade graph search into GraphRAG with entities, relationships, community summaries, and local/global queries.',
  'Add vector search and hybrid retrieval with full-text search, embeddings, and reranking.',
  'Add runtime state to agents: sessions, checkpoints, human approval, and task recovery.',
  'Build an evaluation loop with test sets, scorers, regression gates, and trace inspection.',
  'Add trust fields: source, publish time, confidence, and last verification time.',
] as const;
