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
| 4 | 建立统一内容元数据与校验脚本 | ⬜ | |
| 5 | 完成第一个高质量 Verified Lab | 🔧 | 骨架已有 |
| 6 | 发布第一期 Radar | 🔧 | 代码已有，内容待填 |
| 7 | 完成一篇技术选型文章 | ⬜ | |
| 8 | 重构首页核心入口 | ✅ | HomePageView 组件化 + getHomeStats API |
| 9 | 打通模块关联 | ⬜ | |
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

## 工程基础

- Next.js 16 + React 19 ✅
- FastAPI + Neo4j + PostgreSQL ✅
- pnpm 10.33.4 ✅
- Tailwind CSS v4 ✅
- 双模式启动 ✅
- LF 统一 ✅
- feature 目录对齐架构规范 ✅
- 测试集中 src/test/ ✅

## 下一优先

1. 前端硬编码数据迁后端（4 个静态数组）
2. i18n 默认中文（next-intl）
3. P2 组件归位
4. 批次B Radar 最小闭环

**How to apply**：完成任务后更新本文档。
