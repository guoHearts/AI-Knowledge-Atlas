# AI Knowledge Atlas

面向 AI 工程师的知识图谱与实战课程平台。项目把 Neo4j 知识图谱、FastAPI 数据服务和 Next.js 课程系统整合在一起，用结构化路线帮助学习者理解 AI 技术全貌，并通过可运行实验掌握 Agent、MCP、RAG、LLMOps、多模态和 AI 产品工程。

## 功能亮点

- **AI 知识图谱**：基于 Neo4j 存储技术、模型、产品、公司、框架、评测等实体和关系。
- **实战课程体系**：内置 Agent 工程师路线，覆盖 12 个模块、49 节课程。
- **前沿主题覆盖**：包含 OpenAI Agents SDK、LangGraph、MCP 工具治理、Agent Evals、实时语音 Agent、多模态文档 Agent、AI 编程 Agent、合成数据与蒸馏。
- **后端数据管道**：支持 arXiv、Hugging Face、Hacker News、RSS、GitHub Trending 等来源扩展。
- **一键 Docker 启动**：启动 Neo4j、FastAPI 后端和 Next.js 前端，并自动检查图谱数据。

## 快速启动

前置要求：

- Docker Desktop / Docker Compose
- Git Bash、WSL 或 macOS/Linux shell

启动：

```bash
./start-docker.sh
```

访问：

- 前端：http://localhost:3000
- 知识图谱：http://localhost:3000/graph
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs
- Neo4j Browser：http://localhost:7474

Neo4j 默认账号：

```text
username: neo4j
password: ai-knowledge-graph
```

## 常用命令

```bash
# 启动服务
docker compose up -d --build neo4j backend frontend

# 导入图谱种子数据
docker compose exec -T backend python scripts/seed_data.py

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f backend frontend neo4j

# 停止服务
docker compose down
```

## 项目结构

```text
ai-knowledge-graph/
├── backend/              # FastAPI + Neo4j 图谱 API 与数据管道
├── frontend/             # Next.js 课程平台与图谱前端
├── docs/                 # 测试计划、测试报告等项目文档
├── docker-compose.yml    # Neo4j + Backend + Frontend 编排
├── Dockerfile.backend
├── Dockerfile.nextjs
└── start-docker.sh       # 一键启动脚本
```

## 技术栈

- 后端：Python 3.11, FastAPI, Neo4j, LangChain, APScheduler
- 前端：Next.js 15, React 19, TypeScript, D3.js, Tailwind CSS, MDX
- 数据：Neo4j 图数据库，SQLite 课程进度/课程索引
- 部署：Docker Compose

## API 概览

| Endpoint | 说明 |
| --- | --- |
| `GET /health` | 后端健康检查 |
| `GET /graph/nodes` | 获取图谱节点 |
| `GET /graph/edges` | 获取图谱关系 |
| `GET /graph/nodes/search?q=` | 搜索图谱节点 |
| `GET /graph/nodes/{type}/{id}` | 获取节点详情和邻居 |
| `GET /graph/subgraph` | 获取局部子图 |
| `POST /graph/admin/sync` | 手动触发数据同步 |

## 环境变量

复制 `.env.example` 为 `.env` 后可按需配置：

```bash
cp .env.example .env
```

默认 Docker 启动会关闭后台抓取任务，保证本地演示稳定；需要启用数据同步时设置：

```env
ENABLE_SCHEDULER=true
LLM_API_KEY=your_api_key
LLM_MODEL=gpt-4o
```
