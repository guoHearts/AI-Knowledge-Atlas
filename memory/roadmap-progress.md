---
name: roadmap-progress
description: 对照战略路线图的当前执行进度，2026-07-08 更新
metadata: 
  type: project
  originSessionId: 5daebc9a-99b3-4cc0-8999-2bd2133d4b93
---

# 路线图执行进度

源文档：`docs/AI-Knowledge-Atlas-项目战略与发展路线.md` 第 19 节。

## 当前阶段：阶段 0 — 可信度清理期

## 十大任务进度

| # | 任务 | 状态 | 备注 |
|---|------|------|------|
| 1 | 全量审查 Verified 内容 | ⬜ | |
| 2 | 修复或降级错误/过时内容 | ⬜ | |
| 3 | 重写 README 第一屏 | ✅ | 已完成 |
| 4 | 建立统一内容元数据与校验脚本 | 🔧 | Radar 已有最小元数据校验 |
| 5 | 完成第一个高质量 Verified Lab | 🔧 | 骨架已有 |
| 6 | 发布第一期 Radar | ✅ | 5 条正式条目 + 首页入口 + 下游关联 |
| 7 | 完成一篇技术选型文章 | ⬜ | |
| 8 | 重构首页核心入口 | ✅ | HomePageView 组件化 + getHomeStats API |
| 9 | 打通模块关联 | 🔧 | Radar 已关联 Lab/Graph/Learn，Compare 待补 |
| 10 | 发布 v0.1.0 | ⬜ | |

## 阶段 0 交付物

| 交付物 | 状态 |
|--------|------|
| 全量检查 Verified 内容 | ⬜ |
| 降级不合规内容 | ⬜ |
| 统一 Frontmatter | ⬜ |
| 增加内容验证脚本 | ⬜ |
| 修复 README | ✅ |
| LICENSE/CONTRIBUTING/SECURITY/ROADMAP/Issue 模板 | ✅ |
| 后端统一 API 响应 | ✅ |
| 前端错误处理（全局边界 + request 加固） | ✅ |
| 亮暗双主题 | ✅ |
| 学习种子数据 | ✅ |
| 前端硬编码数据迁后端 | ✅ |
| i18n 默认中文 + 语言切换 | ✅ |
| P2 组件归位 | ✅ |
| Radar 最小闭环 | ✅ |

## 工程基础

- Next.js 16 + React 19 ✅
- FastAPI + Neo4j + PostgreSQL ✅
- pnpm 10.33.4 ✅
- Tailwind CSS v4 ✅
- 双模式启动 ✅
- LF 统一 ✅
- feature 目录对齐架构规范 ✅
- 测试集中 src/test/ ✅
- 首页/Labs/学习元数据由后端 learning catalog 接口提供 ✅
- next-intl 默认中文 + cookie 语言切换 ✅
- Graph/Learn 业务组件与类型归入 feature 目录 ✅

## 下一优先

1. 批次C 第一个高质量 Verified Lab（Secure MCP Server）

## 最新提交与验证

- 最新提交：`e46ad5d feat: publish first radar loop`
- 验证通过：前端 typecheck、前端单测、后端 pytest、Next.js build、Playwright 首页/Radar 详情烟测

## 下一步判定（对照 docs）

依据：
- `docs/AI-Knowledge-Atlas-项目战略与发展路线.md` §19：当前立即执行顺序中，README 和首页核心入口已完成，后续应推进内容状态/标杆 Lab/第一期 Radar/模块关联。
- `docs/AI-Knowledge-Atlas-改造方案.md` §21、§29：不要同时改所有模块，当前最重要的是建立可信度与核心产品闭环。
- `docs/specs/2026-07-08-雷达架构样板改造设计.md` 与 `docs/plans/2026-07-08-雷达架构样板改造实施计划.md`：Radar 架构样板已基本完成，剩余不是架构迁移，而是正式内容闭环。
- `docs/2026-07-08-架构迁移进度评估.md` 的早期状态已有后续迁移更新；当前 Graph/Learn 类型与组件也已归位。

结论：**批次B Radar 最小闭环已完成**，下一步应进入 **批次C 第一个高质量 Verified Lab**。

已完成：
1. Radar 正式数据模型补齐 `status`、`published_at`、`last_verified_at`、`sources`、`related_lab_ids`、`related_node_ids`、`related_learning_paths`。
2. 发布第一期 5 条以内正式 Radar 内容集，每条包含明确结论、官方来源、最后验证日期和适用/不适用场景。
3. 首页增加 Radar 摘要区，形成 `首页 -> Radar -> Lab/Graph/Learn` 路径。
4. 后端服务测试保护 Radar 条目必须具备来源、验证日期、状态和至少一个下游路径。

下一步建议执行拆解：
1. 选择 Secure MCP Server 作为第一个 Verified Lab。
2. 固定依赖版本、运行命令、预期输出和测试用例。
3. 将 Lab 与 Radar MCP 条目、Graph 节点和 Learn 路径双向关联。

**How to apply**：完成任务后更新本文档。
