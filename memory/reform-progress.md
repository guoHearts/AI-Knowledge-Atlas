---
name: reform-progress
description: AI-Knowledge-Atlas 按改造方案分批重构的进度与执行顺序
metadata: 
  type: project
  originSessionId: af8f941a-fc83-4f88-ab87-b3506ae03119
---

项目正按 `docs/AI-Knowledge-Atlas-改造方案.md`（30 章）从"AI 学习平台"重构为"AI 工程技术雷达"。

**执行顺序**：修复错误内容 → 重写定位 → README → 内容状态系统 → 标杆 Lab → 第一期 Radar → 首页 → 图谱 → 学习路线 → 社区。

**批次划分**：
- 批次A 定位与治理 —— ✅ 已完成（2026-07-07）
- 批次B Radar 最小闭环 —— 待做
- 批次C 第一个标杆 Lab —— 待做
- 批次D Compare + 图谱决策化 —— 待做
- 批次E CI/CD + 校验脚本 —— 待做

## 2026-07-08 本轮完成

**后端**：
- `main.py` 直接注册 `modules/*/router.py`，删除 `api/*_routes.py`
- Learning/Content/Progress/Share 全用 `success_response`/`error_response`
- Chat 保留旧格式（RAG 兼容）

**前端 feature 目录对齐 §5.3**：
- `server/` → `api/`，`data/` → `utils/`
- cms/home/labs/learn/progress 已对齐，graph/radar 已合规

**测试**：8 个 test 文件集中到 `src/test/`，脚本指向 `src/test/**/*.test.mts`

**错误处理**：全局 error/not-found/loading.tsx，request.ts 加固（超时+网络错误），API route try/catch

**亮暗主题**：next-themes + lucide-react 图标，CSS 变量 `:root`/`.dark` 双模式

**种子数据**：`docker/postgres/init/002_learning_seed.sql`——1 路线 12 模块 49 课程

**其他**：LF 换行统一、`.gitignore` 新增 `.pytest_cache/`、本地 PG 18 卸载

## 下一步

1. **前端硬编码迁后端**：`homeContent.ts` ROADMAP/NEXT_STEPS、`constants.ts` STAGE_LABELS/ANALOGIES、`labs/utils/labs.ts` LABS、`types/learning.ts` DIFFICULTY_LABELS/CATEGORY_LABELS
2. **i18n 默认中文**：`next-intl`，提取 27 文件的硬编码字符串
3. **P2**：Graph/Learn 组件归位、类型文件归位
4. **批次B**：Radar 最小闭环（后端模型+API、首页雷达屏）

**Why**：记录进度避免下次会话重复摸底。
**How to apply**：新会话先读本条确认进度再动手。
