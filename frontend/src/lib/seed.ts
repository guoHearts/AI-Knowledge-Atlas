import { getDb } from './db';

// Simple UUID generator (no external dependency needed)
function genId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function seedDatabase(): void {
  const db = getDb();

  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as cnt FROM learning_tracks').get() as { cnt: number };
  if (count.cnt > 0) {
    console.log('[seed] Database already seeded, skipping.');
    return;
  }

  console.log('[seed] Seeding database...');

  const trackId = genId();
  const now = new Date().toISOString();

  // ── Learning Track ────────────────────────────────────
  db.prepare(`
    INSERT INTO learning_tracks (id, slug, title, subtitle, description, difficulty, estimated_hours, prerequisites, outcome_skills, outcome_project, icon, sort_order, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    trackId,
    'agent-engineer',
    'Agent 开发工程师',
    '从前端转型 Agent 开发，学完能独立做 Agent 项目',
    '面向有编程基础（JavaScript/TypeScript 或 Python）的开发者，通过 6 个模块系统学习 Agent 开发全栈技能。从第一个 Agent Hello World 到生产级多 Agent 系统设计，每一步都有可运行的代码和可验证的成果。',
    'beginner',
    30,
    '会用终端命令行，掌握至少一门编程语言（JavaScript 或 Python），了解 HTTP 请求基本概念',
    JSON.stringify([
      '独立构建 Agent 系统',
      '掌握 MCP 协议及其实现',
      '熟悉 7 种 Agent 设计模式',
      '能够设计多 Agent 协作系统',
      '具备 Agent 生产部署能力',
      '理解 Agent 可观测性与安全防护',
    ]),
    '企业内部知识助手 Agent：一个能查文档、搜知识库、总结会议纪要的生产级 Agent 系统，包含 CI/CD + Docker + 监控',
    '🤖',
    0,
    'published',
    now,
    now
  );

  // ── Modules ───────────────────────────────────────────
  const modules = [
    {
      title: 'Agent 基础概念与生态',
      description: '从零开始理解 Agent 是什么，建立对 AI Agent 生态的全景认知，动手完成第一个 Agent 程序。',
      stage: 1,
      sortOrder: 1,
      estimatedHours: 4,
      difficulty: 'beginner',
      lessons: [
        {
          title: '什么是 Agent？Agent vs 传统应用',
          slug: 'what-is-agent',
          difficulty: 'beginner',
          estimatedMinutes: 45,
          analogy: '一个能自己上网查资料、动手操作的实习程序员',
          oneLiner: 'AI + 工具 + 自主决策',
          graphNodeIds: JSON.stringify(['agentic-ai', 'llm']),
          tags: JSON.stringify(['Agent 基础', '概念入门']),
          experiment: null,
        },
        {
          title: 'Agent 生态全景',
          slug: 'agent-ecosystem',
          difficulty: 'beginner',
          estimatedMinutes: 45,
          analogy: '就像选择开发语言——Java 还是 Python？各有各的适用场景',
          oneLiner: '了解框架/协议/平台三大赛道',
          graphNodeIds: JSON.stringify(['langchain', 'crewai', 'dify']),
          tags: JSON.stringify(['Agent 基础', '生态对比']),
          experiment: null,
        },
        {
          title: '选择你的第一个 Agent SDK',
          slug: 'choose-first-sdk',
          difficulty: 'beginner',
          estimatedMinutes: 60,
          analogy: '选一把趁手的工具——先学会用锤子，再考虑要不要买电钻',
          oneLiner: '对比主流 SDK，选最适合你的那个',
          graphNodeIds: JSON.stringify(['anthropic-agent-sdk', 'vercel-ai-sdk', 'langchain']),
          tags: JSON.stringify(['Agent 基础', 'SDK']),
          experiment: JSON.stringify({
            title: '环境搭建 + 跑通第一个 Agent',
            description: '选择 Anthropic Agent SDK 或 Vercel AI SDK，完成环境搭建并跑出一个能打招呼的 Agent。',
            template: `// 使用 Anthropic Agent SDK 创建你的第一个 Agent
import { Agent } from '@anthropic-ai/sdk';

async function main() {
  // TODO: 初始化 Agent
  // TODO: 发送第一条消息
  // TODO: 打印回复
}

main().catch(console.error);`,
            tasks: [
              { id: '1', description: '安装 SDK 依赖', hint: 'npm install @anthropic-ai/sdk', verification: 'import 不报错' },
              { id: '2', description: '配置 API Key 环境变量', hint: '创建 .env.local 文件', verification: 'process.env.ANTHROPIC_API_KEY 存在' },
              { id: '3', description: '发送第一条消息并收到回复', hint: '使用 agent.sendMessage()', verification: '控制台打印出 AI 回复' },
            ],
            expectedOutput: 'Agent 回复: "你好！我是你的 AI 助手..."',
            troubleshooting: '如果遇到 401 错误，检查 API Key 是否正确。如果遇到 network error，检查是否需要配置代理。',
          }),
        },
      ],
    },
    {
      title: 'Tool Use 与 Function Calling',
      description: '深入理解 Agent 如何调用工具，掌握 Function Calling 的原理和最佳实践，构建能操作数据库和 API 的 Agent。',
      stage: 2,
      sortOrder: 2,
      estimatedHours: 6,
      difficulty: 'beginner',
      lessons: [
        {
          title: 'Function Calling 原理深度解析',
          slug: 'function-calling-deep-dive',
          difficulty: 'beginner',
          estimatedMinutes: 50,
          analogy: '你给 AI 一本菜单，它点菜，你上菜——AI 说想调什么函数，你来执行',
          oneLiner: '理解 AI 如何"使用工具"的完整流程',
          graphNodeIds: JSON.stringify(['function-calling', 'tool-use']),
          tags: JSON.stringify(['Function Calling', 'Tool Use', '原理']),
          experiment: JSON.stringify({
            title: '5 分钟实验：用 curl 请求 API 让 AI 帮你查天气',
            description: '用最原始的方式——curl 直接调 API——理解 Function Calling 的完整请求-响应循环。',
            template: `// 第一步：不带 tools 的普通请求
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: '北京今天天气怎么样？' }],
  }),
});
const data = await response.json();
console.log('不带 tools 的回复:', data.choices[0].message.content);`,
            tasks: [
              { id: '1', description: '发送不带 tools 的普通请求', hint: '直接复制模板代码', verification: '看到 AI 回复"我无法获取实时天气"' },
              { id: '2', description: '定义天气查询 tool schema', hint: '参考 OpenAI 官方 tool 格式', verification: 'tool 定义包含 name、description、parameters' },
              { id: '3', description: '发送带 tool 的请求，解析 tool_call 响应', hint: 'AI 返回的不是文本而是 tool_calls 数组', verification: '提取 function.name 和 function.arguments' },
            ],
            expectedOutput: '看到 AI 返回 tool_calls，要求调用 get_weather({ "city": "北京" })',
            troubleshooting: '确认 API Key 有 function calling 权限。检查 tool schema 的 parameters 是否符合 JSON Schema 格式。',
          }),
        },
        {
          title: '设计可复用的 Tool 接口',
          slug: 'design-reusable-tools',
          difficulty: 'intermediate',
          estimatedMinutes: 50,
          analogy: '好的 Tool 就像设计良好的 API——命名清晰、参数合理、错误友好',
          oneLiner: '好 Tool 和坏 Tool 的区别在哪？',
          graphNodeIds: JSON.stringify(['tool-use', 'api-design']),
          tags: JSON.stringify(['Tool 设计', '接口设计', '进阶']),
          experiment: JSON.stringify({
            title: '重构 Schema：对比 Agent 成功率',
            description: '给同一个任务，用"坏 Schema"和"好 Schema"分别测试，对比 Agent 调用成功率。',
            template: `// 坏 Schema 示例 —— 你能找出几个问题？
const badSchema = {
  name: 'do_stuff',
  description: 'does things',
  parameters: {
    type: 'object',
    properties: {
      x: { type: 'string' },
    },
  },
};

// TODO: 设计一个好 Schema 用于对比
const goodSchema = {
  // 你的设计...
};`,
            tasks: [
              { id: '1', description: '运行坏 Schema 实验，记录 Agent 调用失败场景', hint: '故意给模糊的输入看 Agent 是否选对 tool', verification: '至少记录 2 个失败场景' },
              { id: '2', description: '设计好 Schema——改进命名、描述和参数', hint: '用动词开头命名、加清晰的参数描述', verification: '同样的输入下成功率>80%' },
              { id: '3', description: '总结 Tool 设计原则', hint: '从实验中归纳 3-5 条原则', verification: '至少写出 3 条可操作的规则' },
            ],
            expectedOutput: 'Tool 设计原则清单 + 对比测试结果',
            troubleshooting: '如果两个 Schema 成功率差不多，尝试更复杂的多 Tool 场景。',
          }),
        },
        {
          title: 'Tool Schema 最佳实践',
          slug: 'tool-schema-best-practices',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          analogy: 'Schema 就像函数的 TypeScript 类型签名——类型越精确，IDE 提示越好，出错越少',
          oneLiner: '撰写让 AI 准确理解的 Tool 描述',
          graphNodeIds: JSON.stringify(['tool-use', 'json-schema']),
          tags: JSON.stringify(['Tool 设计', 'Schema', '最佳实践']),
          experiment: null,
        },
        {
          title: '实战——构建一个数据查询 Agent',
          slug: 'build-data-query-agent',
          difficulty: 'intermediate',
          estimatedMinutes: 90,
          analogy: '给 Agent 配一把数据库钥匙——它能自己写 SQL 并执行',
          oneLiner: '自然语言 → SQL → 结果可视化',
          graphNodeIds: JSON.stringify(['agentic-ai', 'tool-use', 'sqlite']),
          tags: JSON.stringify(['实战', '数据查询', 'SQL']),
          experiment: JSON.stringify({
            title: '构建一个能用自然语言查数据库的 Agent',
            description: '集成 SQLite 数据库 + Text-to-SQL Tool + Agent 循环，实现自然语言数据查询。',
            template: `import sqlite3 from 'better-sqlite3';

// 步骤 1：创建示例数据库
const db = sqlite3(':memory:');
db.exec(\`
  CREATE TABLE employees (id INT, name TEXT, dept TEXT, salary INT);
  INSERT INTO employees VALUES (1, '张三', '工程', 50000);
  INSERT INTO employees VALUES (2, '李四', '产品', 60000);
  INSERT INTO employees VALUES (3, '王五', '工程', 55000);
\`);

// 步骤 2：定义 text-to-SQL tool
const queryDatabase = {
  name: 'query_database',
  description: '执行 SQL 查询并返回结果',
  // TODO: 完成 tool schema 定义
};

// 步骤 3：构建 Agent 循环
async function runAgent(userQuestion: string) {
  // TODO: 实现 Agent 循环
  // 1. 发送用户问题 + tool 定义给 LLM
  // 2. 解析 tool_call → 执行 SQL → 返回结果
  // 3. 如果 LLM 还有 tool_call → 继续循环
  // 4. 否则返回最终回答
}`,
            tasks: [
              { id: '1', description: '创建测试数据库并插入样本数据', hint: '使用 SQLite 内存数据库', verification: '能 SELECT 出 3 条员工记录' },
              { id: '2', description: '实现 text-to-SQL tool', hint: 'tool 接收 SQL 字符串，执行后返回结果', verification: '调用 tool 能执行 SELECT 并返回 JSON' },
              { id: '3', description: '构建 Agent 循环处理多轮 tool call', hint: 'while true 循环直到 LLM 返回最终文本', verification: '问"工程部有哪些人？"能返回正确答案' },
              { id: '4', description: '处理错误 SQL（表名拼错等）', hint: 'try-catch 执行 SQL，错误信息返回给 LLM 重试', verification: '拼错的 SQL 能被 Agent 自动修复' },
            ],
            expectedOutput: '自然语言查询 → Agent 自动生成 SQL → 返回查询结果 → 转化为可读文本',
            troubleshooting: '如果 LLM 生成的 SQL 有语法错误，检查 tool description 中是否明确了表结构信息。',
          }),
        },
      ],
    },
    {
      title: 'MCP 协议——Agent 的通用接口',
      description: '掌握 MCP（Model Context Protocol）协议，理解其作为 Agent 和工具间通用连接标准的架构设计，能独立搭建 MCP Server。',
      stage: 3,
      sortOrder: 3,
      estimatedHours: 5,
      difficulty: 'intermediate',
      lessons: [
        {
          title: 'MCP 协议原理与架构',
          slug: 'mcp-protocol-principles',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          analogy: 'USB-C 接口标准——任何设备都能插，任何 Agent 都能用',
          oneLiner: 'Agent 和工具的通用连接标准',
          graphNodeIds: JSON.stringify(['mcp-protocol', 'anthropic']),
          tags: JSON.stringify(['MCP', '协议', '原理']),
          experiment: null,
        },
        {
          title: '搭建 MCP Server',
          slug: 'build-mcp-server',
          difficulty: 'intermediate',
          estimatedMinutes: 60,
          analogy: '就像给手机装一个 USB-C 转接头——原本插不上的设备现在都能用了',
          oneLiner: '把任何 API 变成 Agent 能直接用的工具',
          graphNodeIds: JSON.stringify(['mcp-protocol', 'mcp-server']),
          tags: JSON.stringify(['MCP', '实战', 'Server']),
          experiment: JSON.stringify({
            title: '从零搭建一个 MCP Server',
            description: '使用 TypeScript MCP SDK 搭建一个具备 2 个 Tool 的 MCP Server，让 Agent 能查天气和发邮件。',
            template: `import { Server } from '@anthropic-ai/mcp-sdk';

// 步骤 1：初始化 MCP Server
const server = new Server({
  name: 'weather-email-server',
  version: '1.0.0',
});

// 步骤 2：注册 Tool
server.addTool({
  name: 'get_weather',
  description: '获取指定城市的天气信息',
  // TODO: 完成参数定义
  handler: async (args) => {
    // TODO: 实现天气查询逻辑
  },
});

// 步骤 3：启动 Server
server.listen({ port: 3001 });`,
            tasks: [
              { id: '1', description: '初始化 MCP Server 项目', hint: 'npm init + 安装 @anthropic-ai/mcp-sdk', verification: 'TypeScript 项目编译通过' },
              { id: '2', description: '注册 get_weather Tool', hint: 'tool schema 包含 name、description、parameters', verification: '用 MCP Inspector 能看到注册的 tool' },
              { id: '3', description: '注册 send_email Tool', hint: '模拟邮件发送，不需要真实 SMTP', verification: '两个 tool 都能被 Agent 发现和调用' },
              { id: '4', description: 'Agent 集成测试', hint: '用 Claude Code 连接你的 MCP Server', verification: 'Agent 能通过你的 MCP Server 查天气+发邮件' },
            ],
            expectedOutput: 'MCP Server 启动成功 → Agent 发现 2 个 Tool → Agent 调用 Tool 获取结果',
            troubleshooting: '检查 MCP Server 端口是否被占用。确认 Tool schema 的 JSON Schema 格式正确。',
          }),
        },
        {
          title: 'MCP Client 集成到 Agent',
          slug: 'mcp-client-integration',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          analogy: '给你的实习程序员配了一整套标准工具箱——不用每次告诉他工具在哪',
          oneLiner: '让 Agent 自动发现和使用 MCP Server 的工具',
          graphNodeIds: JSON.stringify(['mcp-protocol', 'agentic-ai']),
          tags: JSON.stringify(['MCP', 'Client', '集成']),
          experiment: null,
        },
        {
          title: '实战——用 MCP 连接外部数据源',
          slug: 'mcp-external-data-source',
          difficulty: 'intermediate',
          estimatedMinutes: 60,
          analogy: 'Agent 突然能访问公司数据库、Slack 消息、Google 日历——就像装了一堆专业扩展',
          oneLiner: 'MCP → 数据库 + API + 文件系统',
          graphNodeIds: JSON.stringify(['mcp-protocol', 'data-integration']),
          tags: JSON.stringify(['MCP', '实战', '数据源']),
          experiment: JSON.stringify({
            title: '构建能查日历+发邮件+搜网页的 Agent',
            description: '集成 3 个 MCP Server，让 Agent 具备日程管理、邮件和搜索能力。',
            template: `import { Client } from '@anthropic-ai/mcp-sdk';

// 连接 3 个 MCP Server
const calendarClient = new Client('http://localhost:3001');
const emailClient = new Client('http://localhost:3002');
const searchClient = new Client('http://localhost:3003');

// TODO: 构建 Agent 逻辑，根据用户意图选择合适的 MCP Tool`,
            tasks: [
              { id: '1', description: '启动 3 个 MCP Server（日历/邮件/搜索）', hint: '修改前面的 MCP Server 代码', verification: '3 个 Server 都在运行' },
              { id: '2', description: 'Agent 自动路由到正确的 MCP Tool', hint: '根据用户意图选择合适的 Client', verification: '"查下明天日程"→ 调了日历 MCP' },
              { id: '3', description: 'Agent 串联多个 MCP Tool 完成任务', hint: '"搜下明天的会议主题然后邮件通知参会人"', verification: 'Agent 先搜→再发邮件' },
            ],
            expectedOutput: 'Agent 根据用户意图自动选择 MCP Tool → 串联多个 Tool 完成复杂任务',
            troubleshooting: '确保所有 MCP Server 在同一网络下运行。用 console.log 追踪 Agent 的 tool 选择决策。',
          }),
        },
      ],
    },
    {
      title: 'Agent 设计模式',
      description: '系统学习 7 种核心 Agent 设计模式，理解每种模式的动机、结构、实现和取舍，能够组合多个模式设计复杂 Agent 系统。',
      stage: 4,
      sortOrder: 4,
      estimatedHours: 8,
      difficulty: 'advanced',
      lessons: [
        {
          title: 'Pipeline 模式——线性任务链',
          slug: 'pipeline-pattern',
          difficulty: 'intermediate',
          estimatedMinutes: 50,
          analogy: '工厂流水线——每站只做一件事，做完传给下一站',
          oneLiner: 'A→B→C，数据按序流动',
          graphNodeIds: JSON.stringify(['agentic-ai', 'pipeline-pattern']),
          tags: JSON.stringify(['设计模式', 'Pipeline', '编排']),
          experiment: JSON.stringify({
            title: '实现一个内容生成 Pipeline',
            description: '构建 4 步 Pipeline：需求分析 → 大纲生成 → 内容撰写 → 质量检查。',
            template: `interface PipelineStep<T> {
  name: string;
  execute: (input: T) => Promise<T>;
}

class Pipeline<T> {
  private steps: PipelineStep<T>[] = [];

  addStep(step: PipelineStep<T>): this {
    this.steps.push(step);
    return this;
  }

  async run(initial: T): Promise<T> {
    let current = initial;
    for (const step of this.steps) {
      console.log(\`[Pipeline] Running: \${step.name}\`);
      current = await step.execute(current);
    }
    return current;
  }
}

// TODO: 实现 4 个 Pipeline Step，每个调用 LLM`,
            tasks: [
              { id: '1', description: '实现 Pipeline 基类', hint: '顺序执行 steps', verification: 'Pipeline 基类能添加和运行 steps' },
              { id: '2', description: '实现 4 个 LLM Step', hint: '每个 Step 调用 LLM API 处理数据', verification: '4 步全部执行完毕' },
              { id: '3', description: '添加中间结果记录和错误处理', hint: '每一步失败时记录上下文', verification: 'Step 失败不会丢失中间结果' },
            ],
            expectedOutput: '文本输入 → Step1(分析)→ Step2(大纲)→ Step3(撰写)→ Step4(质检)→ 最终文本',
            troubleshooting: '如果某步 LLM 调用超时，增加 retry 逻辑。确保每步的输出格式能被下步正确解析。',
          }),
        },
        {
          title: 'Router 模式——智能分发',
          slug: 'router-pattern',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          analogy: '前台接待员——看一眼访客，就知道该引到哪个部门',
          oneLiner: '根据输入特征分发到不同处理分支',
          graphNodeIds: JSON.stringify(['agentic-ai', 'router-pattern']),
          tags: JSON.stringify(['设计模式', 'Router', '分发']),
          experiment: null,
        },
        {
          title: 'Orchestrator-Worker 模式——主从协作',
          slug: 'orchestrator-worker',
          difficulty: 'intermediate',
          estimatedMinutes: 50,
          analogy: '包工头带施工队——包工头派活，工人各自干自己的',
          oneLiner: '中央调度 → 并行执行 → 汇总',
          graphNodeIds: JSON.stringify(['agentic-ai', 'orchestrator-pattern']),
          tags: JSON.stringify(['设计模式', 'Orchestrator', '协作']),
          experiment: null,
        },
        {
          title: 'Fan-out/Fan-in 模式——并行聚合',
          slug: 'fan-out-fan-in',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          analogy: '项目经理把任务拆成 N 份，分发给 N 个人同时干，最后合并结果',
          oneLiner: '并行执行 → 结果聚合',
          graphNodeIds: JSON.stringify(['agentic-ai', 'fan-out-pattern']),
          tags: JSON.stringify(['设计模式', 'Fan-out', '并行']),
          experiment: null,
        },
        {
          title: 'Human-in-the-loop 模式——人机协同',
          slug: 'human-in-the-loop',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          analogy: '飞机起飞前的塔台批准——关键操作必须人点头',
          oneLiner: 'AI 做事，人在关键时刻拍板',
          graphNodeIds: JSON.stringify(['agentic-ai', 'human-in-the-loop']),
          tags: JSON.stringify(['设计模式', '人机协同', '审批']),
          experiment: null,
        },
        {
          title: 'Self-healing 模式——自动纠错',
          slug: 'self-healing',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '写代码→编译报错→看报错→修改→再编译——这个循环 Agent 能自己做',
          oneLiner: '执行失败 → 自动分析原因 → 修复重试',
          graphNodeIds: JSON.stringify(['agentic-ai', 'self-healing']),
          tags: JSON.stringify(['设计模式', 'Self-healing', '纠错']),
          experiment: null,
        },
        {
          title: '实战——组合多个模式设计完整 Agent 系统',
          slug: 'combining-patterns',
          difficulty: 'advanced',
          estimatedMinutes: 90,
          analogy: '造一辆汽车——Pipeline 是传动轴、Router 是方向盘、Orchestrator 是引擎管理系统',
          oneLiner: '真实世界里没有纯模式，只有组合拳',
          graphNodeIds: JSON.stringify(['agentic-ai', 'design-patterns']),
          tags: JSON.stringify(['设计模式', '综合实战']),
          experiment: JSON.stringify({
            title: '设计并实现一个多模式 Agent 工作流',
            description: '以平台自身的 AI 内容生成管线为案例，组合 Pipeline + Fan-out + Human-in-the-loop + Self-healing 四种模式。',
            template: `// 目标：构建一个 AI 课程内容生成系统
// 要求组合使用至少 3 种设计模式

// Pipeline: 检索 → 大纲 → 生成 → 校验 → 发布
// Fan-out: 大纲通过后，各课时并行生成
// Human-in-the-loop: 大纲需审批，最终需发布确认
// Self-healing: 代码生成后自动执行验证，失败自动修复

// TODO: 设计架构图，完成核心实现`,
            tasks: [
              { id: '1', description: '画出系统架构图（Mermaid 或手绘）', hint: '标注每个模式的边界', verification: '能清晰看到各模式的分工' },
              { id: '2', description: '实现 Pipeline + Fan-out 组合', hint: 'Pipeline 阶段中使用 Promise.all', verification: '多个课时能并行生成' },
              { id: '3', description: '接入 Human-in-the-loop', hint: '大纲生成后暂停等待输入', verification: '输入"approve"才继续' },
              { id: '4', description: '实现 Self-healing 代码验证', hint: 'try-catch 执行代码，失败时把错误信息反馈给 LLM', verification: '代码错误能被自动修复' },
            ],
            expectedOutput: '完整的课程生成系统 + Mermaid 架构图 + 演示视频或截图',
            troubleshooting: '模式组合时注意状态管理。用 console.log 标记每个模式的边界，方便调试。',
          }),
        },
      ],
    },
    {
      title: '多 Agent 工作流',
      description: '学习多 Agent 协作模式，掌握 Agent 间通信和状态管理，能够设计和编排多 Agent 系统解决复杂业务问题。',
      stage: 4,
      sortOrder: 5,
      estimatedHours: 6,
      difficulty: 'advanced',
      lessons: [
        {
          title: '多 Agent 协作模式',
          slug: 'multi-agent-collaboration',
          difficulty: 'intermediate',
          estimatedMinutes: 50,
          analogy: '一个项目组——产品经理想需求、程序员写代码、测试找 Bug',
          oneLiner: '什么时候需要多个 Agent？怎么分工？',
          graphNodeIds: JSON.stringify(['multi-agent', 'agentic-ai']),
          tags: JSON.stringify(['多Agent', '协作', '分工']),
          experiment: null,
        },
        {
          title: 'Agent 间通信与状态管理',
          slug: 'agent-communication',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          analogy: '团队协作需要 Slack 和共享文档——Agent 之间也需要消息通道和共享状态',
          oneLiner: 'Agent A 怎么把结果传给 Agent B？',
          graphNodeIds: JSON.stringify(['multi-agent', 'state-management']),
          tags: JSON.stringify(['多Agent', '通信', '状态']),
          experiment: null,
        },
        {
          title: '工作流编排',
          slug: 'workflow-orchestration',
          difficulty: 'advanced',
          estimatedMinutes: 45,
          analogy: '项目经理排甘特图——哪个先做、哪个并行、哪个依赖哪个',
          oneLiner: '顺序/并行/条件——Agent 工作流的三种编排方式',
          graphNodeIds: JSON.stringify(['workflow', 'orchestration']),
          tags: JSON.stringify(['多Agent', '编排', '工作流']),
          experiment: null,
        },
        {
          title: '实战——客服 Agent 系统',
          slug: 'customer-service-system',
          difficulty: 'advanced',
          estimatedMinutes: 90,
          analogy: '一个客服团队——前台接待分流、技术支持解决、投诉升级处理',
          oneLiner: '3 个 Agent 协作完成客服工单全流程',
          graphNodeIds: JSON.stringify(['multi-agent', 'customer-service']),
          tags: JSON.stringify(['多Agent', '实战', '客服']),
          experiment: JSON.stringify({
            title: '3 个 Agent 协作完成客服工单',
            description: 'Router Agent 分流 → Support Agent 处理技术问题 → Escalation Agent 处理投诉升级。',
            template: `// 3 个 Agent 角色定义
const routerAgent = { role: 'router', goal: '分析用户意图，分发给合适的 Agent' };
const supportAgent = { role: 'support', goal: '解决技术问题' };
const escalationAgent = { role: 'escalation', goal: '处理投诉和紧急升级' };

// TODO: 构建 Agent 间通信机制
// TODO: 实现完整的客服工单流程`,
            tasks: [
              { id: '1', description: '实现 Router Agent 意图分析', hint: '用 LLM 判断用户消息属于哪类', verification: '技术问题→Support，投诉→Escalation' },
              { id: '2', description: '实现 Support Agent 技术解答', hint: '给 Agent 配置常见问题知识库', verification: '能回答至少 3 类技术问题' },
              { id: '3', description: '实现 Escalation Agent 升级处理', hint: '生成工单 + 记录优先级', verification: '投诉能生成格式化工单' },
              { id: '4', description: '实现完整流程的端到端测试', hint: '模拟 3 个不同用户场景', verification: '3 个场景都能正确路由和处理' },
            ],
            expectedOutput: '完整客服系统代码 + 3 个端到端测试用例 + 流程演示',
            troubleshooting: '多 Agent 调试时用不同的日志颜色区分各个 Agent。确保状态在 Agent 间正确传递。',
          }),
        },
      ],
    },
    {
      title: '生产部署与企业实践',
      description: '学习 Agent 系统的可观测性、错误处理和安全防护，完成毕业项目——企业内部知识助手 Agent，具备完整的 CI/CD + Docker + 监控。',
      stage: 5,
      sortOrder: 6,
      estimatedHours: 6,
      difficulty: 'advanced',
      lessons: [
        {
          title: 'Agent 可观测性与日志',
          slug: 'agent-observability',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '给你的 Agent 装一个"黑匣子"——每一步决策、每次 tool 调用都有记录',
          oneLiner: '能看到 Agent "怎么想的"才知道哪里出了问题',
          graphNodeIds: JSON.stringify(['observability', 'logging']),
          tags: JSON.stringify(['生产', '可观测性', '日志']),
          experiment: null,
        },
        {
          title: '错误处理与重试策略',
          slug: 'error-handling-retry',
          difficulty: 'advanced',
          estimatedMinutes: 45,
          analogy: '一份好的保险——不是防止意外发生，而是意外发生时知道怎么处理',
          oneLiner: 'LLM 超时？Tool 报错？Token 用完？每个都有对策',
          graphNodeIds: JSON.stringify(['error-handling', 'retry']),
          tags: JSON.stringify(['生产', '错误处理', '重试']),
          experiment: null,
        },
        {
          title: '安全性——Prompt 注入防护与权限控制',
          slug: 'security-prompt-injection',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '前台不会让访客直接进机房——Agent 也需要权限分级',
          oneLiner: '防止用户用 Prompt 越权操作',
          graphNodeIds: JSON.stringify(['prompt-injection', 'security']),
          tags: JSON.stringify(['生产', '安全', '防护']),
          experiment: null,
        },
      ],
    },
    {
      title: 'RAG 与知识增强检索',
      description: '掌握 RAG 架构的完整技术栈：向量数据库选型、混合检索策略、GraphRAG、Agentic RAG，构建企业级知识问答系统。',
      stage: 6,
      sortOrder: 7,
      estimatedHours: 5,
      difficulty: 'intermediate',
      lessons: [
        {
          title: 'RAG 架构全景——从原理到生产',
          slug: 'rag-architecture',
          difficulty: 'intermediate',
          estimatedMinutes: 50,
          analogy: '考试带参考书——先翻书找答案，再写卷子，答得更准',
          oneLiner: 'Embedding → 检索 → 增强 → 生成',
          graphNodeIds: JSON.stringify(['rag', 'hybrid-search']),
          tags: JSON.stringify(['RAG', '检索增强', '架构']),
          experiment: null,
        },
        {
          title: '向量数据库选型与实战',
          slug: 'vector-database-selection',
          difficulty: 'intermediate',
          estimatedMinutes: 60,
          analogy: '选数据库就像选房子——pgvector 是精装公寓，Pinecone 是全托管酒店',
          oneLiner: 'pgvector、Pinecone、Qdrant、Milvus 全面对比',
          graphNodeIds: JSON.stringify(['pgvector', 'pinecone', 'qdrant', 'milvus']),
          tags: JSON.stringify(['RAG', '向量数据库', '选型']),
          experiment: null,
        },
        {
          title: '混合检索——稠密+稀疏+重排序',
          slug: 'hybrid-retrieval',
          difficulty: 'intermediate',
          estimatedMinutes: 50,
          analogy: '搜索引擎的"语义理解 + 关键词匹配"——两个维度互补',
          oneLiner: '稠密向量 + BM25 关键词 + Cross-encoder 重排序',
          graphNodeIds: JSON.stringify(['hybrid-search', 'rag']),
          tags: JSON.stringify(['RAG', '混合检索', '实战']),
          experiment: null,
        },
        {
          title: 'Agentic RAG——让 Agent 决定何时检索',
          slug: 'agentic-rag',
          difficulty: 'advanced',
          estimatedMinutes: 60,
          analogy: '不是每次对话都翻书，而是 Agent 判断"这个我不确定，查一下"',
          oneLiner: 'Agent 自主决策检索时机和策略',
          graphNodeIds: JSON.stringify(['agentic-ai', 'rag', 'graphrag']),
          tags: JSON.stringify(['RAG', 'Agent', '高级']),
          experiment: null,
        },
      ],
    },
    {
      title: '模型微调与对齐技术',
      description: '系统学习大模型微调技术栈：SFT、LoRA/QLoRA、DPO、GRPO，从单 GPU 微调到生产部署全流程。',
      stage: 6,
      sortOrder: 8,
      estimatedHours: 6,
      difficulty: 'advanced',
      lessons: [
        {
          title: '微调全景——何时微调、何时 RAG',
          slug: 'fine-tuning-overview',
          difficulty: 'intermediate',
          estimatedMinutes: 50,
          analogy: 'RAG 是"考试带参考书"，微调是"考前刷题内化知识"',
          oneLiner: '60-70% 场景 RAG 够用，微调解决 RAG 解决不了的问题',
          graphNodeIds: JSON.stringify(['lora', 'qlora', 'rag']),
          tags: JSON.stringify(['微调', 'LoRA', '决策']),
          experiment: null,
        },
        {
          title: 'LoRA 与 QLoRA 实战——单卡微调 70B 模型',
          slug: 'lora-qlora-practice',
          difficulty: 'advanced',
          estimatedMinutes: 75,
          analogy: 'LoRA 是在原有引擎上加一个小改装件，不改发动机本体',
          oneLiner: '训练 0.1-1% 参数，单张 4090 搞定 70B',
          graphNodeIds: JSON.stringify(['lora', 'qlora', 'unsloth']),
          tags: JSON.stringify(['微调', 'LoRA', '实战']),
          experiment: null,
        },
        {
          title: '偏好对齐——DPO 与 GRPO',
          slug: 'preference-alignment-dpo-grpo',
          difficulty: 'advanced',
          estimatedMinutes: 60,
          analogy: 'DPO 是"两个答案你选哪个"，GRPO 是"做 8 道题，好的加分坏的减分"',
          oneLiner: 'DPO 替代 RLHF，GRPO 做推理增强',
          graphNodeIds: JSON.stringify(['dpo', 'grpo', 'rlhf']),
          tags: JSON.stringify(['微调', '对齐', 'DPO']),
          experiment: null,
        },
        {
          title: '微调生产线——数据→训练→评估→部署',
          slug: 'fine-tuning-pipeline',
          difficulty: 'advanced',
          estimatedMinutes: 60,
          analogy: '工业化生产不是手工作坊——从数据清洗到模型上线的标准化流水线',
          oneLiner: 'Unsloth → TRL → vLLM 多 LoRA 部署',
          graphNodeIds: JSON.stringify(['lora', 'vllm', 'deepeval']),
          tags: JSON.stringify(['微调', '流水线', '生产']),
          experiment: null,
        },
      ],
    },
    {
      title: 'LLMOps 与推理优化',
      description: '掌握 LLM 生产运维全栈：推理引擎选型（vLLM/TensorRT-LLM）、可观测性（Langfuse/LangSmith）、量化部署（AWQ/FP8）、语义缓存。',
      stage: 6,
      sortOrder: 9,
      estimatedHours: 5,
      difficulty: 'advanced',
      lessons: [
        {
          title: '推理引擎对比——vLLM vs TensorRT-LLM vs SGLang',
          slug: 'inference-engines-comparison',
          difficulty: 'advanced',
          estimatedMinutes: 55,
          analogy: '选车型——vLLM 是丰田（可靠省油），TensorRT-LLM 是法拉利（极致性能）',
          oneLiner: 'PagedAttention + Continuous Batching + FP8 量化',
          graphNodeIds: JSON.stringify(['vllm', 'tensorrt-llm', 'sglang']),
          tags: JSON.stringify(['LLMOps', '推理引擎', '对比']),
          experiment: null,
        },
        {
          title: 'LLM 可观测性——Langfuse 与 LangSmith',
          slug: 'llm-observability',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '给你的 LLM 装 APM——每次调用的延迟、Token、质量全部可视化',
          oneLiner: '追踪→评估→成本→告警 四合一',
          graphNodeIds: JSON.stringify(['langfuse', 'langsmith', 'arize-phoenix']),
          tags: JSON.stringify(['LLMOps', '可观测性', '监控']),
          experiment: null,
        },
        {
          title: '量化部署——从 AWQ 到 NVFP4',
          slug: 'quantization-deployment',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '模型减肥——INT4 是"抽脂"、FP8 是"健康饮食"、NVFP4 是"基因优化"',
          oneLiner: 'AWQ/FP8/NVFP4 选型指南',
          graphNodeIds: JSON.stringify(['awq', 'gptq', 'fp8-training', 'nvfp4', 'quantization']),
          tags: JSON.stringify(['LLMOps', '量化', '部署']),
          experiment: null,
        },
        {
          title: 'AI Gateway 与语义缓存',
          slug: 'ai-gateway-caching',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          analogy: 'CDN 缓存网页，语义缓存缓存"意思差不多的提问"',
          oneLiner: '语义缓存命中率 60-85%，延迟降至 0.05s',
          graphNodeIds: JSON.stringify(['ai-gateway', 'semantic-caching', 'portkey']),
          tags: JSON.stringify(['LLMOps', 'Gateway', '缓存']),
          experiment: null,
        },
      ],
    },
    {
      title: 'AI 安全与多模态前沿',
      description: '掌握 AI 安全防护全栈：Prompt 注入防御、内容护栏、红队测试，以及多模态 Agent 开发——视觉+音频+语言的统一感知。',
      stage: 6,
      sortOrder: 10,
      estimatedHours: 5,
      difficulty: 'advanced',
      lessons: [
        {
          title: '多层安全防护体系',
          slug: 'multi-layer-safety',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '银行金库——门口保安 + 密码门 + 监控摄像头，层层防护',
          oneLiner: '输入护栏 → 上下文净化 → 输出护栏 → 系统级权限',
          graphNodeIds: JSON.stringify(['prompt-injection-defense', 'llama-guard', 'prompt-guard']),
          tags: JSON.stringify(['安全', '防护', '护栏']),
          experiment: null,
        },
        {
          title: '红队测试与安全评估',
          slug: 'red-teaming-assessment',
          difficulty: 'advanced',
          estimatedMinutes: 45,
          analogy: '网络安全有渗透测试，AI 有红队测试——主动找漏洞',
          oneLiner: '对抗性测试 → 发现漏洞 → 修复 → 再测试',
          graphNodeIds: JSON.stringify(['red-teaming', 'prompt-injection-defense', 'deepeval']),
          tags: JSON.stringify(['安全', '红队', '评估']),
          experiment: null,
        },
        {
          title: '多模态 Agent 开发入门',
          slug: 'multimodal-agent-intro',
          difficulty: 'intermediate',
          estimatedMinutes: 55,
          analogy: '人类不只用文字交流——看图、听声、读文档，AI 也该如此',
          oneLiner: 'Nemotron Nano Omni 30B — 视觉+音频+语言 统一推理',
          graphNodeIds: JSON.stringify(['multimodal', 'nemotron-nano-omni', 'computer-use-agent']),
          tags: JSON.stringify(['多模态', '视觉', '音频']),
          experiment: null,
        },
        {
          title: '企业合规与 AI 治理',
          slug: 'enterprise-compliance-governance',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          analogy: '公司有法务部，AI 系统也需要"AI 合规官"',
          oneLiner: 'EU AI Act + 模型卡 + 审计日志',
          graphNodeIds: JSON.stringify(['bedrock-guardrails', 'red-teaming']),
          tags: JSON.stringify(['合规', '治理', '企业']),
          experiment: null,
        },
      ],
    },
    {
      title: '前沿 Agent 平台工程',
      description: '把 2025-2026 年主流 Agent 平台能力落到工程实践：Agents SDK、LangGraph 持久化、MCP 工具市场、自动化评测与追踪。',
      stage: 6,
      sortOrder: 11,
      estimatedHours: 6,
      difficulty: 'advanced',
      lessons: [
        {
          title: 'OpenAI Agents SDK 实战——工具、交接与追踪',
          slug: 'openai-agents-sdk-handoffs-tracing',
          difficulty: 'advanced',
          estimatedMinutes: 55,
          analogy: '给 Agent 团队装上对讲机、工牌和行程记录仪',
          oneLiner: 'Agent + Tool + Handoff + Trace',
          graphNodeIds: JSON.stringify(['openai-agents-sdk', 'agentic-ai', 'tracing']),
          tags: JSON.stringify(['OpenAI', 'Agents SDK', 'Tracing']),
          experiment: JSON.stringify({
            title: '搭建一个带交接与追踪的研究助理',
            description: '实现 triage agent 将任务交接给 researcher 或 writer，并记录每次工具调用与最终输出。',
            template: `from agents import Agent, Runner, function_tool

@function_tool
def search_notes(query: str) -> str:
    return "返回内部知识库中与 query 相关的摘要"

researcher = Agent(name="Researcher", instructions="查找事实并列出来源。", tools=[search_notes])
writer = Agent(name="Writer", instructions="把研究结果写成结构化摘要。")
triage = Agent(name="Triage", instructions="判断任务需要研究还是写作，并交接给合适的 Agent。", handoffs=[researcher, writer])

result = Runner.run_sync(triage, "整理 MCP 在企业 Agent 中的价值")
print(result.final_output)`,
            tasks: [
              { id: '1', description: '创建 triage/researcher/writer 三个 Agent', hint: '每个 Agent 只承担一个职责', verification: '任务能被路由到正确 Agent' },
              { id: '2', description: '添加一个检索工具并限制输入 schema', hint: '工具只接收 query 字符串', verification: '追踪里能看到工具调用参数' },
              { id: '3', description: '查看一次完整 trace 并标注瓶颈', hint: '关注 handoff、tool call、final output 三段', verification: '能解释失败点或延迟来源' },
            ],
            expectedOutput: '一段带来源摘要的研究结果，以及一次可复盘的 Agent 执行 trace',
            troubleshooting: '如果 Agent 总是自己回答，检查 handoff 描述是否足够明确，并把 researcher/writer 的职责边界写窄。',
          }),
        },
        {
          title: 'LangGraph 持久化工作流——让 Agent 不中断',
          slug: 'langgraph-durable-human-loop',
          difficulty: 'advanced',
          estimatedMinutes: 60,
          analogy: '把 Agent 流程从一次性聊天，升级成可暂停、可恢复、可审计的工单系统',
          oneLiner: 'StateGraph + Checkpointer + Interrupt',
          graphNodeIds: JSON.stringify(['langgraph', 'human-in-the-loop', 'checkpointing']),
          tags: JSON.stringify(['LangGraph', '持久化', 'HITL']),
          experiment: JSON.stringify({
            title: '实现一个可暂停审批的发布 Agent',
            description: '内容生成后自动暂停，等待人工批准后再发布；所有状态可恢复。',
            template: `from langgraph.graph import StateGraph, END
from langgraph.types import interrupt, Command

def draft(state):
    return {"draft": "生成的发布内容"}

def approve(state):
    decision = interrupt({"draft": state["draft"], "question": "是否发布？"})
    return {"approved": decision == "approve"}

def publish(state):
    return {"published": state["approved"]}

graph = StateGraph(dict)
graph.add_node("draft", draft)
graph.add_node("approve", approve)
graph.add_node("publish", publish)
graph.set_entry_point("draft")
graph.add_edge("draft", "approve")
graph.add_edge("approve", "publish")
graph.add_edge("publish", END)`,
            tasks: [
              { id: '1', description: '定义 draft、approve、publish 三个节点', hint: '审批节点用 interrupt 暂停', verification: '流程会停在审批点' },
              { id: '2', description: '配置 checkpointer 和 thread_id', hint: '同一个 thread_id 恢复同一条流程', verification: '刷新后仍能继续审批' },
              { id: '3', description: '补充拒绝路径', hint: '拒绝时回到 draft 修改', verification: '拒绝不会直接 publish' },
            ],
            expectedOutput: '一个能暂停、恢复、拒绝、批准的 Agent 发布工作流',
            troubleshooting: '如果恢复失败，优先检查 checkpointer 是否配置，以及 invoke/resume 是否使用相同 thread_id。',
          }),
        },
        {
          title: 'MCP 工具市场化——从单个 Server 到可治理生态',
          slug: 'mcp-tool-marketplace-governance',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '不是给 Agent 塞一堆插件，而是建设一个有权限、有版本、有审计的应用商店',
          oneLiner: 'Tool Registry + Permission + Versioning',
          graphNodeIds: JSON.stringify(['mcp-protocol', 'mcp-server', 'governance']),
          tags: JSON.stringify(['MCP', '工具治理', '企业平台']),
          experiment: null,
        },
        {
          title: 'Agent 评测流水线——从演示可用到持续可靠',
          slug: 'agent-evals-regression-pipeline',
          difficulty: 'advanced',
          estimatedMinutes: 55,
          analogy: '给 Agent 上单元测试、集成测试和质检抽样',
          oneLiner: 'Dataset + Grader + Regression Gate',
          graphNodeIds: JSON.stringify(['evals', 'deepeval', 'braintrust', 'agent-as-judge']),
          tags: JSON.stringify(['评测', 'Evals', '质量门禁']),
          experiment: null,
        },
      ],
    },
    {
      title: 'AI 产品实战新形态',
      description: '补齐更贴近真实产品的 AI 能力：实时语音、多模态文档理解、AI 编程 Agent、合成数据与蒸馏，让课程从“会调用模型”走向“能做产品”。',
      stage: 6,
      sortOrder: 12,
      estimatedHours: 6,
      difficulty: 'advanced',
      lessons: [
        {
          title: '实时语音 Agent——低延迟对话产品架构',
          slug: 'realtime-voice-agent-architecture',
          difficulty: 'advanced',
          estimatedMinutes: 55,
          analogy: '文字聊天像发邮件，实时语音像电话客服；延迟、打断和状态都变成核心问题',
          oneLiner: 'WebRTC + Streaming + Turn Detection',
          graphNodeIds: JSON.stringify(['realtime-api', 'voice-agent', 'streaming']),
          tags: JSON.stringify(['实时语音', 'WebRTC', '产品架构']),
          experiment: JSON.stringify({
            title: '设计一个支持打断的语音客服 Agent',
            description: '画出浏览器、实时模型、业务工具和人工转接之间的数据流，并实现前端状态机。',
            template: `type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "handoff";

function nextState(state: VoiceState, event: string): VoiceState {
  if (event === "user_interrupt") return "listening";
  if (state === "listening" && event === "speech_end") return "thinking";
  if (state === "thinking" && event === "model_audio") return "speaking";
  if (event === "need_human") return "handoff";
  return state;
}`,
            tasks: [
              { id: '1', description: '定义语音 Agent 的五个状态', hint: 'idle/listening/thinking/speaking/handoff', verification: '每个状态都有进入和退出条件' },
              { id: '2', description: '补充用户打断逻辑', hint: 'speaking 中收到 user_interrupt 应回到 listening', verification: '不会继续播放旧回答' },
              { id: '3', description: '设计工具调用期间的话术', hint: '长工具调用要给用户进度反馈', verification: '用户不会在静默中等待超过 2 秒' },
            ],
            expectedOutput: '一个低延迟语音 Agent 状态机和数据流设计',
            troubleshooting: '如果体验像“等机器人念稿”，优先优化 turn detection、打断处理和工具调用时的填充反馈。',
          }),
        },
        {
          title: '多模态文档 Agent——表格、截图、PDF 一起理解',
          slug: 'multimodal-document-agent',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '普通 RAG 只读文字，多模态文档 Agent 像能看懂截图和报表的分析师',
          oneLiner: 'OCR + Layout + Vision Model + RAG',
          graphNodeIds: JSON.stringify(['multimodal', 'rag', 'document-ai']),
          tags: JSON.stringify(['多模态', '文档理解', 'RAG']),
          experiment: null,
        },
        {
          title: 'AI 编程 Agent——从代码补全到任务级开发',
          slug: 'coding-agent-task-workflow',
          difficulty: 'advanced',
          estimatedMinutes: 55,
          analogy: '从“自动补全一句代码”升级到“接一张开发工单”',
          oneLiner: 'Repo Context + Plan + Patch + Test',
          graphNodeIds: JSON.stringify(['coding-agent', 'software-engineering', 'evals']),
          tags: JSON.stringify(['AI 编程', '开发工作流', '测试']),
          experiment: null,
        },
        {
          title: '合成数据与蒸馏——小模型也能做垂直任务',
          slug: 'synthetic-data-distillation',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '让大模型当老师，给小模型出题、批改、总结错题本',
          oneLiner: 'Teacher Model + Synthetic Data + Distillation',
          graphNodeIds: JSON.stringify(['synthetic-data', 'distillation', 'fine-tuning']),
          tags: JSON.stringify(['合成数据', '蒸馏', '小模型']),
          experiment: null,
        },
      ],
    },
  ];

  // ── Insert modules and lessons ─────────────────────────
  const insertModule = db.prepare(`
    INSERT INTO modules (id, track_id, title, description, stage, sort_order, estimated_hours, difficulty, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (id, module_id, title, slug, content_path, sort_order, difficulty, estimated_minutes, analogy, one_liner, experiment_config, design_pattern_id, graph_node_ids, tags, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const mod of modules) {
    const moduleId = genId();
    insertModule.run(
      moduleId, trackId, mod.title, mod.description, mod.stage,
      mod.sortOrder, mod.estimatedHours, mod.difficulty, 'published', now, now
    );

    for (let i = 0; i < mod.lessons.length; i++) {
      const lesson = mod.lessons[i];
      const lessonId = genId();
      const contentFolders: Record<number, string> = {
        1: 'module-01-foundation',
        2: 'module-02-tool-use',
        3: 'module-03-mcp',
        4: 'module-04-design-patterns',
        5: 'module-05-multi-agent',
        6: 'module-06-production',
        7: 'module-07-production',
        8: 'module-08-production',
        9: 'module-09-production',
        10: 'module-10-production',
        11: 'module-11-agent-platform',
        12: 'module-12-ai-product-patterns',
      };
      const contentPath = `agent-engineer/${contentFolders[mod.sortOrder]}/${String(i + 1).padStart(2, '0')}-${lesson.slug}.mdx`;

      insertLesson.run(
        lessonId, moduleId, lesson.title, lesson.slug, contentPath,
        i + 1, lesson.difficulty, lesson.estimatedMinutes, lesson.analogy,
        lesson.oneLiner, lesson.experiment || null, null,
        lesson.graphNodeIds || '[]', lesson.tags || '[]', 'published', now, now
      );
    }
  }

  // ── Design Patterns ────────────────────────────────────
  const designPatterns = [
    {
      name: 'pipeline',
      title: 'Pipeline 模式',
      category: 'orchestration',
      description: '任务按固定顺序流经多个处理阶段，每个阶段可以访问上游阶段的输出结果。',
      motivation: '当一个任务可以分解为多个独立的、顺序执行的处理步骤时，Pipeline 提供清晰的关注点分离。没有这个模式之前，开发者往往将所有逻辑写在一个巨型函数中，难以测试和复用。',
      structureDiagram: `graph LR
    A[输入] --> B[Step 1: 预处理]
    B --> C[Step 2: 处理]
    C --> D[Step 3: 后处理]
    D --> E[输出]`,
      implementationGuide: '每个 Step 是一个独立的函数或 Agent，接收上游输出作为输入。Pipeline 容器负责按序执行并传递上下文。',
      codeExampleLangchain: `from langchain_core.runnables import RunnableSequence

step1 = prompt1 | llm | output_parser
step2 = prompt2 | llm | output_parser
pipeline = RunnableSequence([step1, step2])`,
      codeExampleAnthropic: `async function pipeline<T>(steps: Step<T>[], input: T): Promise<T> {
  let current = input;
  for (const step of steps) {
    current = await step.execute(current);
  }
  return current;
}`,
      tradeoffs: '优点：结构清晰，易于测试和调试。缺点：不适合需要动态决策的场景，前步阻塞会导致整体延迟。',
      whenToUse: '任务可分解为固定的顺序步骤，每步之间依赖明确。',
      whenNotToUse: '任务步骤不确定，需要根据中间结果动态决定下一步。',
      relatedPatternIds: JSON.stringify([]),
      relatedGraphNodes: JSON.stringify(['pipeline-pattern', 'agentic-ai']),
      enterpriseScenario: '内容生成流水线、数据处理 ETL、代码审查流程',
      interviewQuestions: 'Pipeline 模式和 Chain 模式的区别是什么？什么场景下 Pipeline 比 Orchestrator 更合适？',
    },
    {
      name: 'router',
      title: 'Router 模式',
      category: 'orchestration',
      description: '根据输入特征将任务分发给不同的处理分支，每个分支专门处理一类问题。',
      motivation: '不同类型的用户请求需要不同的处理策略。Router 避免了在一个巨型 if-else 中处理所有情况。',
      structureDiagram: `graph TD
    A[输入] --> B{Router}
    B -->|类型A| C[Handler A]
    B -->|类型B| D[Handler B]
    B -->|类型C| E[Handler C]`,
      implementationGuide: 'Router 本身是一个 LLM 调用，分析输入意图后选择对应的 Handler。',
      codeExampleLangchain: `from langgraph.graph import StateGraph

def router(state):
    if state["intent"] == "tech":
        return "tech_support"
    return "general"`,
      codeExampleAnthropic: `async function route(input: string, handlers: Map<string, Handler>): Promise<Result> {
  const intent = await classifyIntent(input);
  const handler = handlers.get(intent) || defaultHandler;
  return handler.process(input);
}`,
      tradeoffs: '优点：每种类型独立优化，容易扩展新分支。缺点：Router 本身成为单点，分类错误导致流程失败。',
      whenToUse: '输入类型明确可分，每类有不同的处理逻辑。',
      whenNotToUse: '输入类型模糊或重叠严重，边界不清。',
      relatedPatternIds: JSON.stringify([]),
      relatedGraphNodes: JSON.stringify(['router-pattern', 'agentic-ai']),
      enterpriseScenario: '智能客服意图分发、代码审查分类、内容审核路由',
      interviewQuestions: 'Router 的分类依据可以有哪些？如何评估 Router 的准确率？',
    },
    {
      name: 'orchestrator-worker',
      title: 'Orchestrator-Worker 模式',
      category: 'collaboration',
      description: '中央协调者（Orchestrator）拆解任务，分发给多个专职 Worker，汇总结果。',
      motivation: '复杂任务需要多个专业 Agent 协作完成，需要有一个中央调度来拆解和汇总。',
      structureDiagram: `graph TD
    O[Orchestrator] --> W1[Worker 1]
    O --> W2[Worker 2]
    O --> W3[Worker 3]
    W1 --> O
    W2 --> O
    W3 --> O`,
      implementationGuide: 'Orchestrator 分析任务→生成子任务→并行/顺序分发给 Worker→收集结果→综合输出。',
      codeExampleLangchain: '',
      codeExampleAnthropic: `class Orchestrator {
  async execute(task: string): Promise<Result> {
    const subtasks = await this.decompose(task);
    const results = await Promise.all(
      subtasks.map(st => this.workers[st.type].execute(st))
    );
    return this.synthesize(results);
  }
}`,
      tradeoffs: '优点：Worker 可独立开发优化，系统灵活。缺点：Orchestrator 是关键瓶颈，调度策略复杂。',
      whenToUse: '复杂任务需要多种专业能力，各子任务相对独立。',
      whenNotToUse: '简单任务，或者子任务间有强依赖关系。',
      relatedPatternIds: JSON.stringify([]),
      relatedGraphNodes: JSON.stringify(['orchestrator-pattern', 'multi-agent']),
      enterpriseScenario: '项目管理 Agent + 专项执行 Agent、复杂数据处理',
      interviewQuestions: 'Orchestrator 如何保证 Worker 的输出质量？Worker 挂了怎么办？',
    },
    {
      name: 'fan-out-fan-in',
      title: 'Fan-out/Fan-in 模式',
      category: 'collaboration',
      description: '同一任务并行分发给多个 Agent 处理，聚合所有结果。',
      motivation: '有些任务需要多个视角同时处理以提高质量或覆盖面，或者加速处理速度。',
      structureDiagram: `graph LR
    A[任务] --> B1[Agent 1]
    A --> B2[Agent 2]
    A --> B3[Agent 3]
    B1 --> C[聚合]
    B2 --> C
    B3 --> C`,
      implementationGuide: 'Fan-out: 任务克隆 N 份并行发送。Fan-in: 收集结果后合并/投票/聚合。',
      codeExampleLangchain: '',
      codeExampleAnthropic: `async function fanOutFanIn(task: string, agents: Agent[]): Promise<Result> {
  const results = await Promise.all(agents.map(a => a.process(task)));
  return aggregate(results); // 投票/合并/去重
}`,
      tradeoffs: '优点：并行加速，多视角提高质量。缺点：成本 N 倍增加，结果聚合需要额外设计。',
      whenToUse: '需要多维度分析、并行加速、或 Ensemble 提高准确性的场景。',
      whenNotToUse: '成本敏感或结果不需要多视角验证的简单任务。',
      relatedPatternIds: JSON.stringify([]),
      relatedGraphNodes: JSON.stringify(['fan-out-pattern', 'multi-agent']),
      enterpriseScenario: '多维度代码审查、多源信息检索、安全审计 Ensemble',
      interviewQuestions: 'Fan-out 后如何决定 Fan-in 的聚合策略？投票 vs 加权 vs 级联？',
    },
    {
      name: 'human-in-the-loop',
      title: 'Human-in-the-loop 模式',
      category: 'quality',
      description: '关键节点暂停 Agent 执行，等待人工审批后继续。',
      motivation: '某些操作（如内容发布、金融交易）风险太高，必须人类确认。',
      structureDiagram: `graph LR
    A[Agent 执行] --> B{关键节点}
    B -->|暂停| C[等待人工审批]
    C -->|批准| D[继续执行]
    C -->|拒绝| E[回退/修改]`,
      implementationGuide: 'Agent 执行到关键节点时触发中断，通过 UI 或 API 等待人工输入。',
      codeExampleLangchain: `from langgraph.checkpoint import MemorySaver
# 使用 interrupt_before 标记需要人工审批的节点
graph.compile(checkpointer=MemorySaver(), interrupt_before=["publish"])`,
      codeExampleAnthropic: `async function withHumanApproval(action: Action): Promise<void> {
  const preview = await agent.preview(action);
  const approved = await askHuman(preview);  // 等待人工输入
  if (approved) {
    await agent.execute(action);
  }
}`,
      tradeoffs: '优点：关键操作安全可控。缺点：引入延迟，人工节点成为瓶颈。',
      whenToUse: '高风险操作、合规要求、内容质量把关。',
      whenNotToUse: '低风险、高频操作，人工审批得不偿失。',
      relatedPatternIds: JSON.stringify([]),
      relatedGraphNodes: JSON.stringify(['human-in-the-loop', 'agentic-ai']),
      enterpriseScenario: '内容发布审批、金融交易确认、医疗诊断辅助',
      interviewQuestions: '如何设计审批界面？审批超时怎么办？审批记录如何审计？',
    },
    {
      name: 'self-healing',
      title: 'Self-healing 模式',
      category: 'quality',
      description: '执行失败后自动分析错误原因并重试修正。',
      motivation: 'LLM 生成的代码或决策不一定一次就正确，Self-healing 通过"执行→观察→修正"循环提高成功率。',
      structureDiagram: `graph LR
    A[生成] --> B[执行]
    B -->|成功| C[输出]
    B -->|失败| D[分析错误]
    D --> E[修正]
    E --> B`,
      implementationGuide: 'try-catch 执行 → 捕获错误信息 → 将错误信息反馈给 LLM → LLM 修正 → 重新执行 → 直到成功或达到重试上限。',
      codeExampleLangchain: '',
      codeExampleAnthropic: `async function selfHealing(generate: () => Promise<Code>, maxRetries = 3): Promise<Result> {
  for (let i = 0; i < maxRetries; i++) {
    const code = await generate();
    try {
      const result = await execute(code);
      return result;
    } catch (error) {
      // 将错误反馈给生成器
      setErrorContext(error.message);
    }
  }
  throw new Error('Max retries exceeded');
}`,
      tradeoffs: '优点：自动提高成功率，减少人工干预。缺点：重试消耗 Token 和时间，可能陷入死循环。',
      whenToUse: '代码生成、数据转换等高失败率但可自动修复的场景。',
      whenNotToUse: '失败原因无法从错误信息判断、或修复成本极高的场景。',
      relatedPatternIds: JSON.stringify([]),
      relatedGraphNodes: JSON.stringify(['self-healing', 'agentic-ai']),
      enterpriseScenario: '代码生成→运行→报错→自动修复循环、数据清洗自动修正',
      interviewQuestions: 'Self-healing 超过最大重试次数后怎么办？如何避免死循环？',
    },
    {
      name: 'verifier-generator',
      title: 'Verifier-Generator 模式',
      category: 'quality',
      description: '生成器和校验器交替工作，直到产出合格结果。',
      motivation: '有些任务的质量标准可以自动化验证，通过"生成→校验→修正"循环确保持续改进。',
      structureDiagram: `graph LR
    G[Generator] --> V[Verifier]
    V -->|合格| O[输出]
    V -->|不合格| G`,
      implementationGuide: 'Generator 生成内容 → Verifier 打分/检查 → 不通过则提供反馈给 Generator 重试。',
      codeExampleLangchain: '',
      codeExampleAnthropic: `async function verifierGenerator(
  generate: () => Promise<Output>,
  verify: (o: Output) => Promise<{passed: boolean; feedback: string}>,
  maxIterations = 5
): Promise<Output> {
  for (let i = 0; i < maxIterations; i++) {
    const output = await generate();
    const { passed, feedback } = await verify(output);
    if (passed) return output;
    updateFeedback(feedback); // 反馈注入到下一次生成
  }
  throw new Error('Could not produce valid output');
}`,
      tradeoffs: '优点：输出质量有保证。缺点：校验标准需要精确定义，不是所有任务都能自动校验。',
      whenToUse: '质量目标可量化/可自动验证的任务。',
      whenNotToUse: '质量依赖主观判断、难以自动化的任务。',
      relatedPatternIds: JSON.stringify([]),
      relatedGraphNodes: JSON.stringify(['self-healing', 'agentic-ai']),
      enterpriseScenario: '课程内容质量保证、代码生成+测试验证、翻译质量检查',
      interviewQuestions: 'Verifier 的标准从哪来？如何避免 Verifier 过于严格导致永远不通过？',
    },
    {
      name: 'context-window-management',
      title: 'Context Window Management 模式',
      category: 'architecture',
      description: '长对话和大文档场景下的上下文压缩与分片策略，在有限上下文窗口内最大化信息密度。',
      motivation: 'LLM 的上下文窗口有限（128K-1M tokens），但实际企业场景常需要处理远超窗口大小的信息（大型代码库、多文档查询）。这个模式通过分块、摘要、动态加载等策略解决长上下文的工程挑战。',
      structureDiagram: `graph TD
    A[长文档/长对话] --> B{Context Manager}
    B -->|分块| C[Chunker]
    B -->|摘要| D[Summarizer]
    B -->|检索| E[Retriever]
    C --> F[滑动窗口]
    D --> G[层次化摘要]
    E --> H[动态上下文注入]
    F --> I[LLM 调用]
    G --> I
    H --> I`,
      implementationGuide: `三种核心策略：
1. **滑动窗口**：保留最近的 N tokens，较旧的上下文丢弃
2. **层次化摘要**：将长对话分为多个段落，每段生成摘要，需要时注入相关摘要
3. **动态上下文注入**：类似 RAG，但检索的是当前对话的历史关键信息

实际生产系统通常组合使用：滑动窗口管理最近上下文 + 层次化摘要保存关键决策 + 动态注入恢复历史细节。`,
      codeExampleLangchain: `from langgraph.checkpoint import MemorySaver
# 使用 LangGraph 的 checkpointer 管理上下文
# 配合 trim_messages 限制上下文长度
from langchain_core.messages import trim_messages

trimmer = trim_messages(
    max_tokens=100000,
    strategy="last",
    token_counter=model,
    include_system=True,
)`,
      codeExampleAnthropic: `interface ContextWindow {
  maxTokens: number;
  strategy: 'sliding' | 'summarize' | 'hybrid';
  summaries: Map<string, string>; // key → summary
}

async function manageContext(
  messages: Message[],
  window: ContextWindow
): Promise<Message[]> {
  const tokenCount = estimateTokens(messages);

  if (tokenCount <= window.maxTokens) return messages;

  // 策略 1: 滑动窗口 — 保留最近的
  if (window.strategy === 'sliding') {
    return trimToTokenLimit(messages, window.maxTokens);
  }

  // 策略 2: 摘要 — 压缩历史
  if (window.strategy === 'summarize') {
    const recent = messages.slice(-20);
    const history = messages.slice(0, -20);
    const summary = await summarizeHistory(history);
    return [summary, ...recent];
  }

  // 策略 3: 混合 — 摘要 + 滑动窗口
  return hybridManage(messages, window);
}`,
      tradeoffs: '优点：突破了固定上下文窗口限制，让 Agent 能处理任意长度的对话和文档。缺点：摘要可能丢失细节，动态检索增加了延迟，策略选择需要根据业务场景调优。',
      whenToUse: '长对话 Agent（> 100 轮）、大型代码库分析、多文档问答、会议纪要总结。',
      whenNotToUse: '短对话、固定格式的简单任务、上下文需求可预测的场景。',
      relatedPatternIds: JSON.stringify([]),
      relatedGraphNodes: JSON.stringify(['long-context', 'rag', 'semantic-caching']),
      enterpriseScenario: '代码库分析 Agent（一次性读取整个 repo）、长文档问答（PDF 500 页+）、客户服务长对话管理',
      interviewQuestions: '滑动窗口、层次化摘要、动态检索三种策略各自适用什么场景？如何评估上下文管理策略的信息损失？',
    },
    {
      name: 'agent-as-judge',
      title: 'Agent as Judge 模式',
      category: 'architecture',
      description: '使用一个 LLM Agent 评估另一个 Agent 的输出质量，实现自动化评测、代码审查和质量门禁。',
      motivation: '在大规模 Agent 系统中，人工审查每个 Agent 的输出不可行。Agent as Judge 通过专门的评估 Agent 实现自动化质量保证，类似于代码审查中的"审查者"角色，但面向 Agent 的输出。',
      structureDiagram: `graph LR
    A[Worker Agent] -->|生成输出| B{输出 + 上下文}
    B --> C[Judge Agent]
    C -->|评分 + 反馈| D{通过?}
    D -->|是| E[发布/继续]
    D -->|否| F[退回修改]
    F -->|反馈| A`,
      implementationGuide: `Judge Agent 需要明确定义评估标准和评分维度：
1. **正确性**：输出是否符合事实？
2. **完整性**：是否覆盖了所有需求？
3. **安全性**：是否包含有害内容？
4. **风格一致性**：是否符合企业品牌调性？

Judge 输出结构化评估（JSON Schema），包含通过/不通过、评分和具体反馈。`,
      codeExampleLangchain: `from langgraph.graph import StateGraph

def judge_node(state):
    """Judge Agent 评估 Worker 输出"""
    worker_output = state["worker_output"]
    criteria = state["quality_criteria"]

    judge_prompt = f"""
    你是输出质量评估专家。按以下标准评分（1-10）：
    {criteria}

    输出：{worker_output}

    返回 JSON: {{"scores": {{}}, "passed": bool, "feedback": ""}}
    """
    result = judge_llm.invoke(judge_prompt)
    return {"judge_result": result}`,
      codeExampleAnthropic: `interface JudgeCriteria {
  correctness: number;   // 0-10
  completeness: number;  // 0-10
  safety: number;        // 0-10
  style: number;         // 0-10
}

interface JudgeResult {
  scores: JudgeCriteria;
  passed: boolean;       // 所有维度 > 7
  feedback: string;
}

async function judgeOutput(
  workerOutput: string,
  context: string,
  rubrics: string[]
): Promise<JudgeResult> {
  const prompt = \`你是质量评估专家。
评估标准：\${rubrics.join('; ')}
上下文：\${context}
待评估输出：\${workerOutput}

返回 JSON（严格遵循 schema）。\`;

  const result = await judgeAgent.sendMessage(prompt);
  return parseJudgeResult(result);
}`,
      tradeoffs: '优点：自动化质量保证，可扩展审查能力，24/7 运行。缺点：Judge 本身可能出错或产生偏见，评估标准的主观部分难以量化，额外的 Token 和延迟成本。',
      whenToUse: '自动化代码审查、内容质量门禁、Agent 输出验证、合规性检查、多 Agent 系统的质量控制。',
      whenNotToUse: '高风险决策（需要人类最终审批）、创意性工作（评判标准主观性强）、实时性要求极高的场景。',
      relatedPatternIds: JSON.stringify([]),
      relatedGraphNodes: JSON.stringify(['agentic-ai', 'deepeval', 'braintrust', 'red-teaming']),
      enterpriseScenario: 'CMS 内容发布前自动审核、代码 PR 自动审查、客服对话质量评估、合规文档检查',
      interviewQuestions: '如何确保 Judge Agent 不会产生系统性偏见？Judge 的评估标准如何与人类评估对齐（校准）？',
    },
  ];

  const insertPattern = db.prepare(`
    INSERT INTO design_patterns (id, name, title, category, description, motivation, structure_diagram, implementation_guide, code_example_langchain, code_example_anthropic, tradeoffs, when_to_use, when_not_to_use, related_pattern_ids, related_graph_nodes, enterprise_scenario, interview_questions, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const dp of designPatterns) {
    insertPattern.run(
      genId(), dp.name, dp.title, dp.category, dp.description, dp.motivation,
      dp.structureDiagram, dp.implementationGuide, dp.codeExampleLangchain,
      dp.codeExampleAnthropic, dp.tradeoffs, dp.whenToUse, dp.whenNotToUse,
      dp.relatedPatternIds, dp.relatedGraphNodes, dp.enterpriseScenario,
      dp.interviewQuestions, now, now
    );
  }

  console.log('[seed] Database seeded successfully!');
  console.log(`  - 1 learning track`);
  console.log(`  - ${modules.length} modules`);
  console.log(`  - ${modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons`);
  console.log(`  - ${designPatterns.length} design patterns`);
}

export function ensureLatestCurriculum(): void {
  const db = getDb();
  const now = new Date().toISOString();
  const track = db.prepare('SELECT id FROM learning_tracks WHERE slug = ?').get('agent-engineer') as { id: string } | undefined;
  if (!track) return;

  const latestModules = [
    {
      title: '前沿 Agent 平台工程',
      description: '把 2025-2026 年主流 Agent 平台能力落到工程实践：Agents SDK、LangGraph 持久化、MCP 工具市场、自动化评测与追踪。',
      stage: 6,
      sortOrder: 11,
      estimatedHours: 6,
      difficulty: 'advanced',
      folder: 'module-11-agent-platform',
      lessons: [
        {
          title: 'OpenAI Agents SDK 实战——工具、交接与追踪',
          slug: 'openai-agents-sdk-handoffs-tracing',
          difficulty: 'advanced',
          estimatedMinutes: 55,
          analogy: '给 Agent 团队装上对讲机、工牌和行程记录仪',
          oneLiner: 'Agent + Tool + Handoff + Trace',
          graphNodeIds: JSON.stringify(['openai-agents-sdk', 'agentic-ai', 'tracing']),
          tags: JSON.stringify(['OpenAI', 'Agents SDK', 'Tracing']),
        },
        {
          title: 'LangGraph 持久化工作流——让 Agent 不中断',
          slug: 'langgraph-durable-human-loop',
          difficulty: 'advanced',
          estimatedMinutes: 60,
          analogy: '把 Agent 流程从一次性聊天，升级成可暂停、可恢复、可审计的工单系统',
          oneLiner: 'StateGraph + Checkpointer + Interrupt',
          graphNodeIds: JSON.stringify(['langgraph', 'human-in-the-loop', 'checkpointing']),
          tags: JSON.stringify(['LangGraph', '持久化', 'HITL']),
        },
        {
          title: 'MCP 工具市场化——从单个 Server 到可治理生态',
          slug: 'mcp-tool-marketplace-governance',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '不是给 Agent 塞一堆插件，而是建设一个有权限、有版本、有审计的应用商店',
          oneLiner: 'Tool Registry + Permission + Versioning',
          graphNodeIds: JSON.stringify(['mcp-protocol', 'mcp-server', 'governance']),
          tags: JSON.stringify(['MCP', '工具治理', '企业平台']),
        },
        {
          title: 'Agent 评测流水线——从演示可用到持续可靠',
          slug: 'agent-evals-regression-pipeline',
          difficulty: 'advanced',
          estimatedMinutes: 55,
          analogy: '给 Agent 上单元测试、集成测试和质检抽样',
          oneLiner: 'Dataset + Grader + Regression Gate',
          graphNodeIds: JSON.stringify(['evals', 'deepeval', 'braintrust', 'agent-as-judge']),
          tags: JSON.stringify(['评测', 'Evals', '质量门禁']),
        },
      ],
    },
    {
      title: 'AI 产品实战新形态',
      description: '补齐更贴近真实产品的 AI 能力：实时语音、多模态文档理解、AI 编程 Agent、合成数据与蒸馏，让课程从“会调用模型”走向“能做产品”。',
      stage: 6,
      sortOrder: 12,
      estimatedHours: 6,
      difficulty: 'advanced',
      folder: 'module-12-ai-product-patterns',
      lessons: [
        {
          title: '实时语音 Agent——低延迟对话产品架构',
          slug: 'realtime-voice-agent-architecture',
          difficulty: 'advanced',
          estimatedMinutes: 55,
          analogy: '文字聊天像发邮件，实时语音像电话客服；延迟、打断和状态都变成核心问题',
          oneLiner: 'WebRTC + Streaming + Turn Detection',
          graphNodeIds: JSON.stringify(['realtime-api', 'voice-agent', 'streaming']),
          tags: JSON.stringify(['实时语音', 'WebRTC', '产品架构']),
        },
        {
          title: '多模态文档 Agent——表格、截图、PDF 一起理解',
          slug: 'multimodal-document-agent',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '普通 RAG 只读文字，多模态文档 Agent 像能看懂截图和报表的分析师',
          oneLiner: 'OCR + Layout + Vision Model + RAG',
          graphNodeIds: JSON.stringify(['multimodal', 'rag', 'document-ai']),
          tags: JSON.stringify(['多模态', '文档理解', 'RAG']),
        },
        {
          title: 'AI 编程 Agent——从代码补全到任务级开发',
          slug: 'coding-agent-task-workflow',
          difficulty: 'advanced',
          estimatedMinutes: 55,
          analogy: '从“自动补全一句代码”升级到“接一张开发工单”',
          oneLiner: 'Repo Context + Plan + Patch + Test',
          graphNodeIds: JSON.stringify(['coding-agent', 'software-engineering', 'evals']),
          tags: JSON.stringify(['AI 编程', '开发工作流', '测试']),
        },
        {
          title: '合成数据与蒸馏——小模型也能做垂直任务',
          slug: 'synthetic-data-distillation',
          difficulty: 'advanced',
          estimatedMinutes: 50,
          analogy: '让大模型当老师，给小模型出题、批改、总结错题本',
          oneLiner: 'Teacher Model + Synthetic Data + Distillation',
          graphNodeIds: JSON.stringify(['synthetic-data', 'distillation', 'fine-tuning']),
          tags: JSON.stringify(['合成数据', '蒸馏', '小模型']),
        },
      ],
    },
  ];

  const insertModule = db.prepare(`
    INSERT INTO modules (id, track_id, title, description, stage, sort_order, estimated_hours, difficulty, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (id, module_id, title, slug, content_path, sort_order, difficulty, estimated_minutes, analogy, one_liner, experiment_config, design_pattern_id, graph_node_ids, tags, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateTrack = db.prepare(`
    UPDATE learning_tracks
    SET estimated_hours = CASE WHEN estimated_hours < 42 THEN 42 ELSE estimated_hours END,
        updated_at = ?
    WHERE id = ?
  `);
  updateTrack.run(now, track.id);

  for (const mod of latestModules) {
    let moduleRow = db.prepare('SELECT id FROM modules WHERE track_id = ? AND sort_order = ?').get(track.id, mod.sortOrder) as { id: string } | undefined;
    if (!moduleRow) {
      const moduleId = genId();
      insertModule.run(
        moduleId, track.id, mod.title, mod.description, mod.stage,
        mod.sortOrder, mod.estimatedHours, mod.difficulty, 'published', now, now
      );
      moduleRow = { id: moduleId };
    }

    for (let i = 0; i < mod.lessons.length; i++) {
      const lesson = mod.lessons[i];
      const existingLesson = db.prepare('SELECT id FROM lessons WHERE module_id = ? AND slug = ?').get(moduleRow.id, lesson.slug);
      if (existingLesson) continue;

      const contentPath = `agent-engineer/${mod.folder}/${String(i + 1).padStart(2, '0')}-${lesson.slug}.mdx`;
      insertLesson.run(
        genId(), moduleRow.id, lesson.title, lesson.slug, contentPath,
        i + 1, lesson.difficulty, lesson.estimatedMinutes, lesson.analogy,
        lesson.oneLiner, null, null, lesson.graphNodeIds, lesson.tags, 'published', now, now
      );
    }
  }

  const pathFixes = [
    { sortOrder: 3, folder: 'module-03-mcp' },
    { sortOrder: 4, folder: 'module-04-design-patterns' },
    { sortOrder: 5, folder: 'module-05-multi-agent' },
    { sortOrder: 9, folder: 'module-09-production' },
    { sortOrder: 10, folder: 'module-10-production' },
  ];
  for (const fix of pathFixes) {
    const moduleRow = db.prepare('SELECT id FROM modules WHERE track_id = ? AND sort_order = ?').get(track.id, fix.sortOrder) as { id: string } | undefined;
    if (!moduleRow) continue;
    const lessonRows = db.prepare('SELECT id, slug, sort_order FROM lessons WHERE module_id = ? ORDER BY sort_order').all(moduleRow.id) as { id: string; slug: string; sort_order: number }[];
    for (const lesson of lessonRows) {
      const contentPath = `agent-engineer/${fix.folder}/${String(lesson.sort_order).padStart(2, '0')}-${lesson.slug}.mdx`;
      db.prepare('UPDATE lessons SET content_path = ?, updated_at = ? WHERE id = ?').run(contentPath, now, lesson.id);
    }
  }
}
