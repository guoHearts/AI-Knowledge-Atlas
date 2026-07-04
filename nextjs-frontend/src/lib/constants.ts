export const APP_NAME = 'AI Knowledge Atlas';
export const APP_DESCRIPTION = '面向 AI 工程师的知识图谱与实战课程平台：用图谱理解技术全貌，用课程完成真实项目';

export const TRACK_SLUGS = {
  AGENT_ENGINEER: 'agent-engineer',
  AI_FULLSTACK: 'ai-fullstack',
  MULTI_AGENT_ARCHITECT: 'multi-agent-architect',
} as const;

export const STAGE_LABELS: Record<number, { title: string; goal: string }> = {
  1: { title: '感知', goal: '亲手触摸 AI，建立体感' },
  2: { title: '理解', goal: '理解工作机制，能自己改造' },
  3: { title: '连接', goal: '让 Agent 连接真实世界' },
  4: { title: '设计', goal: '掌握设计模式，独立设计架构' },
  5: { title: '交付', goal: '生产级交付' },
  6: { title: '扩展', goal: '深度掌握企业级 AI 全栈' },
};

export const ANALOGIES: Record<string, { analogy: string; oneLiner: string }> = {
  agent: {
    analogy: '一个能自己上网查资料、动手操作的实习程序员',
    oneLiner: 'AI + 工具 + 自主决策',
  },
  mcp: {
    analogy: 'USB-C 接口标准——任何设备都能插',
    oneLiner: 'Agent 和工具的通用连接标准',
  },
  'function-calling': {
    analogy: '你给 AI 一本菜单，它点菜，你上菜',
    oneLiner: 'AI 说想调什么函数，你来执行',
  },
  rag: {
    analogy: '考试带参考书——先翻书找答案，再写卷子',
    oneLiner: '先检索知识，再让 AI 回答',
  },
  pipeline: {
    analogy: '工厂流水线——每站只做一件事，做完传给下一站',
    oneLiner: 'A→B→C，数据按序流动',
  },
  orchestrator: {
    analogy: '包工头带施工队——包工头派活，工人各自干自己的',
    oneLiner: '中央调度 → 并行执行 → 汇总',
  },
  'human-in-the-loop': {
    analogy: '飞机起飞前的塔台批准——关键操作必须人点头',
    oneLiner: 'AI 做事，人在关键时刻拍板',
  },
  token: {
    analogy: 'AI 阅读的"字"——一个汉字≈2 token',
    oneLiner: 'AI 按字数收费的基本单位',
  },
  embedding: {
    analogy: '把一段文字的"意思"压缩成一串数字坐标',
    oneLiner: '语义相近的文字≈坐标靠近的点',
  },
  'vector-db': {
    analogy: '超级智能的"找相似"引擎',
    oneLiner: '不按关键词搜，按意思搜',
  },
};
