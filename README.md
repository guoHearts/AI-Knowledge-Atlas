# AI Knowledge Atlas

> 持续更新、来源可追溯、代码可运行的 AI 工程技术雷达。

AI Knowledge Atlas 帮助开发者理解快速变化的 AI 工程生态，把新模型、新框架和新实践转化为**有明确结论、有官方来源、能真实运行**的技术内容：

- **AI Engineering Radar** — 每周精选值得关注的技术变化，说明为什么重要、何时使用
- **技术选型地图（Compare）** — 面向真实场景，直接给出选型结论与决策树
- **可运行实验（Labs）** — 版本锁定、一条命令启动、经过运行验证的小型项目
- **知识图谱（Atlas）** — 探索模型、框架、协议之间的关系与演进路径
- **系统学习路线（Learn）** — Agents、RAG、MCP、Evals、LLMOps 与多模态

> 不只告诉你出现了什么，还会说明为什么重要、何时使用，以及如何运行。

## 你可以在这里解决什么问题？

- 最近有哪些 AI 技术真正值得关注？
- 不同 Agent 框架（LangGraph / OpenAI Agents SDK / Claude Agent SDK）应该如何选择？→ [技术选型地图](./docs/tech-comparisons/)
- 一个新方案是否已经适合生产环境？
- 如何用最小代码验证一个论文或框架的能力？
- 一项技术与已有模型、工具和工程模式之间是什么关系？

## 项目现状

项目正在按 [改造路线图](./ROADMAP.md) 从"学习平台"重构为"技术雷达"。当前模块状态：

| 模块 | 说明 | 状态 |
|---|---|---|
| Atlas（知识图谱） | Neo4j 图谱 + 可视化探索 | ✅ 已上线 |
| Learn（学习路线） | 结构化课程与图谱联动 | ✅ 已上线 |
| Radar（技术雷达） | 每周精选技术变化 | 🚧 建设中 |
| Compare（技术选型） | 对比与决策树 | ✅ 有内容 |
| Labs（可运行实验） | 版本锁定的标杆实验 | 🚧 建设中 |

内容可信度规范见 [内容可信度标准](./docs/content-standards.md)：所有技术内容都标注状态（Verified / Stale / Draft / Deprecated）、官方来源与最后验证日期。

## 快速开始

默认开发模式：Neo4j 用 Docker 启动，FastAPI 后端与 Next.js 前端在本机运行，保留数据库隔离性同时支持前后端热更新。

### 前置要求

- Docker Desktop / Docker Compose
- Python 3.11+
- Node.js 20+
- pnpm（版本锁定见 `frontend/package.json` 的 `packageManager` 字段）
- **Windows 额外要求**：Visual Studio 2022 Build Tools（`better-sqlite3` 等原生模块需要 C++ 编译器）

<details>
<summary>Windows 安装 Visual Studio Build Tools</summary>

`better-sqlite3`、`sharp` 等原生模块需要 C++ 编译工具链。缺少 VS Build Tools 时 `pnpm install` 会报 `Could not locate the bindings file`。

```powershell
winget install Microsoft.VisualStudio.2022.BuildTools --silent `
  --override "--wait --quiet --installPath D:\VS2022BuildTools --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

pnpm v10+ 默认阻止依赖构建脚本，本项目已在 `frontend/package.json` 配置 `pnpm.onlyBuiltDependencies` 白名单，正常 `pnpm install` 即可；若仍缺失可运行 `pnpm approve-builds`。
</details>

### 启动

Windows（PowerShell）：

```powershell
.\start.ps1
# 或
.\Make.ps1 start
```

macOS / Linux / Git Bash：

```bash
./start-docker.sh
```

启动后访问：

- 前端：http://localhost:3000
- 知识图谱：http://localhost:3000/graph
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs
- Neo4j Browser：http://localhost:7474 （默认 `neo4j` / `ai-knowledge-graph`）

### 常用命令

```powershell
# Windows
.\Make.ps1 install     # 安装前后端依赖
.\Make.ps1 start       # 启动 Neo4j + 本地后端 + 本地前端
.\Make.ps1 docker-up   # 只启动 Docker 依赖服务
.\Make.ps1 seed        # 导入图谱种子数据
.\Make.ps1 status      # 查看状态
.\Make.ps1 stop        # 停止全部服务
```

```bash
# macOS / Linux
./start-docker.sh            # 一键启动
docker compose up -d neo4j   # 只启动依赖服务
# 后端
cd backend && NEO4J_URI=bolt://localhost:7687 ENABLE_SCHEDULER=false \
  .venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# 前端
cd frontend && NEXT_PUBLIC_API_URL=http://localhost:8000 pnpm dev
```

如需把前后端也放入 Docker，显式启用 `app` profile：

```bash
docker compose --profile app up -d --build neo4j backend frontend
```

### 环境变量

复制 `.env.example` 为 `.env` 后按需修改：

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=ai-knowledge-graph
ENABLE_SCHEDULER=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```

默认关闭后端抓取调度以保证本地演示稳定。需要数据同步时：

```env
ENABLE_SCHEDULER=true
LLM_API_KEY=your_api_key
LLM_MODEL=gpt-4o
```

## 项目架构

```text
AI-Knowledge-Atlas/
├── frontend/             # Next.js 15 + React 19 课程平台与图谱前端
├── backend/              # FastAPI + Neo4j 图谱 API 与数据管道
│   ├── api/              # 路由：graph / content / progress / chat / share
│   ├── extractors/       # 采集器：arXiv / GitHub Trending / HN / HuggingFace / RSS
│   ├── knowledge/        # 内容管道：抽取 / 去重 / 生成
│   └── scheduler/        # 定时采集调度
├── docs/                 # 项目文档、改造方案、内容标准
├── docker-compose.yml    # 默认 Neo4j；app profile 保留 Docker 前后端
└── start.ps1 / start-docker.sh   # 本地开发启动脚本
```

## 技术栈

- **后端**：Python 3.11、FastAPI、Neo4j、LangChain、APScheduler
- **前端**：Next.js 15、React 19、TypeScript、D3.js、Tailwind CSS、MDX
- **数据**：Neo4j 图数据库；SQLite（课程进度与索引）
- **本地依赖服务**：Docker Compose

## 内容可信度

每篇技术内容都标注创建 / 更新 / 最后验证日期、依赖版本、官方来源与内容状态。区分 `Verified` 与 `Stale`，并计划通过 CI 自动检测过期内容。详见 [内容可信度标准](./docs/content-standards.md)。

## 参与贡献

欢迎补充官方来源、修复失效链接、为 Lab 增加 Dockerfile、贡献翻译或对比项。请先阅读：

- [贡献指南](./CONTRIBUTING.md)
- [行为准则](./CODE_OF_CONDUCT.md)
- [安全策略](./SECURITY.md)

## 路线图

见 [ROADMAP.md](./ROADMAP.md)。改造顺序：修复错误内容 → 重写定位 → 内容状态系统 → 标杆 Lab → 第一期 Radar → 首页 → 图谱 → 学习路线 → 社区。

## License

[MIT](./LICENSE)

---

**GitHub Topics 建议**：`ai-engineering` `ai-agents` `agentic-ai` `rag` `mcp` `llmops` `llm-evaluation` `graph-rag` `knowledge-graph` `generative-ai` `fastapi` `nextjs` `neo4j`
