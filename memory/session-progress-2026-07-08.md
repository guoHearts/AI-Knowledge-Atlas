---
name: session-progress-2026-07-08
description: 2026-07-08 会话进度——架构迁移收尾 + 统一响应 + 错误处理 + 亮暗主题
metadata:
  type: project
---

## 本轮完成

### 架构迁移收尾
- 后端 `main.py` 直接注册 `modules/*/router.py`，删除 `api/*_routes.py`
- 前端 feature 目录 `server/`→`api/`、`data/`→`utils/`，对齐架构文档 §5.3
- 测试文件集中到 `src/test/`

### 后端统一响应
- Learning/Content/Progress/Share 全用 `success_response`/`error_response`
- Chat 保留旧格式（RAG 兼容）
- Radar/Graph 已全量统一

### 前端错误处理
- 全局 `error.tsx`/`not-found.tsx`/`loading.tsx`
- `request.ts`：网络错误 → ApiError、15s 超时
- 7 个 API route + Radar proxy 加固

### 亮暗双主题
- `next-themes` + `lucide-react` Sun/Moon 图标
- CSS 变量 `:root`/`.dark` 双模式
- GraphCanvas/MiniGraph/ProgressBar SVG 硬编码 → CSS 变量

### 其他
- 种子数据：`002_learning_seed.sql`（1 路线 12 模块 49 课程）
- 全部 CRLF → LF
- 本地 PostgreSQL 18 卸载（端口冲突）
- `.gitignore` 新增 `.pytest_cache/`

### 前端硬编码迁后端
- 新增后端 `modules/learning/catalog.py`，统一托管首页 roadmap/nextSteps、学习 metadata、Labs 元数据
- 新增 `/learning/home/content`、`/learning/metadata`、`/learning/labs`、`/learning/labs/{lab_id}`
- 删除前端 `features/home/utils/homeContent.ts`
- 首页、学习路线页、Labs 列表/详情改为通过 feature API 读取后端数据
- `DIFFICULTY_LABELS`/`CATEGORY_LABELS` 从前端类型文件移出；前端仅保留难度颜色展示映射

### i18n 默认中文 + 语言切换
- 安装并配置 `next-intl`：`next.config.mjs` 插件 + `src/i18n/request.ts`
- 新增 `messages/zh-CN.json`、`messages/en-US.json`
- 根布局接入 `NextIntlClientProvider` 与国际化 metadata
- 导航、主题按钮、首页、Labs、学习路线、全局 loading/error/not-found、图谱 loading 文案接入消息文件
- 新增 `LocaleToggle`，通过 `locale` cookie 在 `zh-CN` / `en-US` 间切换并刷新页面

### P2 组件归位
- `components/graph/*` → `features/graph/components/*`
- `components/learn/*` → `features/learn/components/*`
- `types/graph.ts` → `features/graph/types/graph.types.ts`
- `types/learning.ts` → `features/learn/types/learning.ts`
- `DifficultyBadge` 从 shared 归入 Learn feature，避免 shared 依赖业务类型
- 删除空的全局业务目录 `components/graph`、`components/learn`、`types` 和过渡用 `lib/api.ts`

### 批次B Radar 最小闭环
- 后端 Radar sample/demo 数据升级为 5 条正式 AI Engineering Radar 条目
- Radar 条目补齐 `status`、`published_at`、`last_verified_at`、官方来源、推荐/不推荐场景
- Radar service 增加最小内容校验，测试覆盖来源、验证日期、状态和下游路径
- 首页新增 Radar 摘要区与完整 Radar 入口
- Radar 详情展示状态与关联路径，可跳转 Lab、Graph 或 Learn

## 提交

- `3a46ad6` feat: 后端统一响应 + 前端错误处理 + 亮暗双主题 + 学习种子数据
- `4d3abab` refactor: 收敛 feature 目录对齐架构规范 + 测试集中
- `382fe21` refactor: colocate graph and learn frontend modules
- `e46ad5d` feat: publish first radar loop

## 验证记录

批次B Radar 最小闭环完成后已验证：
- `pnpm.cmd --dir frontend typecheck`
- `pnpm.cmd --dir frontend test`
- `python -m pytest tests -q`
- `pnpm.cmd --dir frontend build`
- Playwright 烟测：首页 Radar 摘要、Radar 详情关联路径、控制台无 error

## 下一步

1. 批次C 第一个标杆 Lab（Secure MCP Server）

## Docs 对照结论

已读 `docs/AI-Knowledge-Atlas-项目战略与发展路线.md`、`docs/AI-Knowledge-Atlas-改造方案.md`、Radar spec/plan 和架构迁移评估。

批次B Radar 最小闭环已完成。

下一步明确为：**批次C 第一个标杆 Lab**。

优先做：
- 选择 Secure MCP Server 作为第一个 Verified Lab
- 固定依赖版本、运行命令、预期输出和测试
- Lab 关联 Radar MCP 条目、Graph 节点和 Learn 路径
