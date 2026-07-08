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

## 提交

- `3a46ad6` feat: 后端统一响应 + 前端错误处理 + 亮暗双主题 + 学习种子数据
- `4d3abab` refactor: 收敛 feature 目录对齐架构规范 + 测试集中

## 下一步

1. 前端硬编码数据迁后端（4 文件）
2. i18n 默认中文
3. P2 组件归位
4. 批次B Radar 最小闭环
