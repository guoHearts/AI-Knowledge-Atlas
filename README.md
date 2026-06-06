# AI 前沿知识图谱

交互式 AI 知识图谱，自动追踪 AI 领域最新技术、模型、产品和 Agent 动态。

## 快速开始

### 前置要求
- Docker & Docker Compose
- OpenAI API Key（或其他兼容的 LLM API）

### 安装

1. 克隆并配置环境变量
   ```bash
   cp .env.example .env
   # 编辑 .env，填入你的 LLM_API_KEY
   ```

2. 启动所有服务
   ```bash
   docker compose up -d
   ```

3. 导入种子数据
   ```bash
   docker compose exec backend python scripts/seed_data.py
   ```

4. 打开浏览器
   - 前端：http://localhost:3000
   - 后端 API：http://localhost:8000
   - Neo4j Browser：http://localhost:7474

### 使用

- **浏览图谱** — 拖拽、滚轮缩放
- **点击节点** — 右侧面板查看详情和学习资源
- **搜索** — 顶部搜索框输入技术/模型/产品名
- **筛选** — 顶部标签按类型过滤
- **分享** — 将当前视图生成分享链接

## 架构

```
信息源 (arXiv/HF/HN/RSS/GitHub) → 数据管道 → Neo4j → FastAPI → React+D3.js
```

## 数据模型

### 8 种节点类型
| 类型 | 标签 | 示例 |
|------|------|------|
| Technology | 技术/概念 | Agentic AI, MCP 协议, GraphRAG |
| Model | 模型 | GPT-5, Claude Opus 4.8, DeepSeek-V4 |
| Product | 产品/工具 | Claude Code, Cursor, Perplexity |
| AgentFramework | Agent 框架 | LangChain, CrewAI, Dify |
| AgentType | Agent 类型 | 自主 Agent, 代码 Agent |
| Company | 公司 | OpenAI, Anthropic, 深度求索 |
| Paper | 论文 | arXiv 论文, 技术博客 |
| Benchmark | 评测基准 | SWE-bench, MMLU, HumanEval |

### 9 种关系类型
BASED_ON, PROPOSED_BY, RELEASED, COMPETES_WITH, BELONGS_TO, POWERS, EVALUATED_BY, CATEGORY_OF, IMPROVES

## 技术栈

- 后端：Python 3.11+, FastAPI, Neo4j 5.x, LangChain, APScheduler
- 前端：React 19+, TypeScript, D3.js, Tailwind CSS, Vite
- 部署：Docker Compose

## 信息源

| 来源 | 内容 | 更新 |
|------|------|------|
| arXiv | cs.AI, cs.CL, cs.CV 论文 | 每日 |
| Hugging Face | Daily Papers 社区精选 | 每日 |
| Hacker News | AI 相关热帖 | 实时 |
| RSS | 公司技术博客 | 每周 |
| GitHub Trending | AI/ML 热门仓库 | 每日 |

## API 端点

| 端点 | 说明 |
|------|------|
| `GET /graph/nodes` | 列出所有节点（可按类型筛选） |
| `GET /graph/nodes/search?q=` | 全文搜索节点 |
| `GET /graph/nodes/{type}/{id}` | 节点详情+邻居 |
| `GET /graph/edges` | 列出所有关系 |
| `GET /graph/timeline` | 时间线最新节点 |
| `POST /graph/admin/sync` | 手动触发数据同步 |
| `POST /share/` | 生成分享链接 |
| `GET /share/{id}` | 获取分享视图 |
| `GET /health` | 健康检查 |

## 项目结构

```
ai-knowledge-graph/
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── .env.example
├── backend/
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置管理
│   ├── api/                 # API 路由
│   │   ├── graph_routes.py  # 图谱浏览 API
│   │   └── share_routes.py  # 分享链接 API
│   ├── models/              # 数据模型
│   │   ├── schema.py        # Neo4j schema
│   │   ├── graph.py         # Pydantic 模型
│   │   └── repository.py    # Neo4j 数据访问
│   ├── extractors/          # 数据源适配器
│   ├── knowledge/           # LLM 知识提取
│   ├── scheduler/           # 定时任务
│   └── scripts/             # 工具脚本
└── frontend/
    └── src/
        ├── App.tsx          # 主布局
        ├── components/      # UI 组件
        ├── hooks/           # 自定义 hooks
        ├── pages/           # 页面组件
        └── types/           # TypeScript 类型
```
