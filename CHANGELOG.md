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

### 变更

- 重写 `README.md`：项目定位调整为"持续更新、来源可追溯、代码可运行的 AI 工程技术雷达"
- 首页移除无明确计算依据的"企业级能力雷达"评分，Hero 文案对齐新定位
- 首页 roadmap/nextSteps、学习标签元数据、Labs 元数据从前端静态数组迁移到后端提供
- 首页、Labs、学习路线、全局错误/加载状态接入国际化消息文件

<!--
后续版本示例：

## [0.1.0] - 2026-XX-XX — Positioning Reset

- 新 README 与首页
- 第一份 AI Engineering Radar
- 第一个 Verified Lab
- 内容状态系统
-->
