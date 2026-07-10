# 更新日志

本项目的所有重要变更都会记录在此文件。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 新增

- 开源治理文件：`LICENSE`（MIT）、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`CHANGELOG.md`、`ROADMAP.md`
- `.github` Issue 与 PR 模板
- 内容可信度标准文档 `docs/content-standards.md`：内容状态（Verified / Stale / Draft / Deprecated）、必填元数据、审核 checklist
- 后端 learning catalog 接口：`/learning/home/content`、`/learning/metadata`、`/learning/labs`
- `next-intl` 国际化基础设施，默认中文，并提供导航栏语言切换按钮（中文 / English）
- 第一期 AI Engineering Radar 最小闭环：5 条正式 Radar 条目、状态/验证日期/官方来源元数据、首页 Radar 摘要入口、Graph/Learn/Lab 下游关联
- GitHub Actions CI（`.github/workflows/ci.yml`）：backend job 跑 `pytest` + `content_check.cli`，frontend job 跑 `lint` / `typecheck` / `test` / `build`

### 修复

- 知识图谱页搜索下拉框被画布遮挡不可见（P0）：给 `GraphToolbar` 外层显式设置 `relative z-20`，使工具栏层叠上下文位于画布之上
- CMS "Course editor" 入口点击后 404（P1）：卡片链接改为指向第一个 track（`/cms/editor/<slug>`），不再指向无参数的 catch-all 路由
- 雷达详情页分类徽章大小写错误（"Mcp" → "Model Context Protocol"）：改用后端分类正规显示名查表，不再用正则逐词首字母大写
- 首页"学习地图"卡片长文案换行时被 "Module" 徽章遮挡：卡片增加底部内边距为绝对定位徽章预留空间
- 首页"学习地图 / 近期工作"切换中文后仍显示英文：`catalog.ROADMAP` / `NEXT_STEPS` 补齐中英双语，`/learning/home/content` 支持 `locale` 参数
- 学习路线页"学完你将能够"板块内容为空：补齐 `agent-engineer` track 的 `outcome_skills` / `outcome_project` 种子数据，并在数据为空时隐藏该区块

### 变更

- 重写 `README.md`：项目定位调整为"持续更新、来源可追溯、代码可运行的 AI 工程技术雷达"
- 首页移除无明确计算依据的"企业级能力雷达"评分，Hero 文案对齐新定位
- 首页 roadmap/nextSteps、学习标签元数据、Labs 元数据从前端静态数组迁移到后端提供
- 首页、Labs、学习路线、全局错误/加载状态接入国际化消息文件
- Graph/Learn 业务组件与类型文件归位到对应 feature 目录，移除全局业务组件目录与旧类型入口
- Radar 数据从 sample/demo 升级为可校验内容集，后端服务层强制校验 `status`、`published_at`、`last_verified_at`、官方来源和至少一个下游路径

<!--
后续版本示例：

## [0.1.0] - 2026-XX-XX — Positioning Reset

- 新 README 与首页
- 第一份 AI Engineering Radar
- 第一个 Verified Lab
- 内容状态系统
-->
