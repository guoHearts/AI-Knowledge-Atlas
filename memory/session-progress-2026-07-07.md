---
name: session-progress-2026-07-07
description: 2026-07-07 最小升级验证进度——对照改造方案检查完成度并尝试启动项目
metadata:
  type: project
---

## 任务：验证最小升级完成度 + 启动项目检查可行性

### 对照改造方案 §21（第1周：定位和可信度）完成情况

**已完成 ✅：**
- [x] 重写 README 第一屏 — 新定位"持续更新、来源可追溯、代码可运行的 AI 工程技术雷达"
- [x] 明确项目一句话定位
- [x] 首页移除无法解释的企业能力评分（Hero 文案已对齐新定位）
- [x] LICENSE (MIT)
- [x] CONTRIBUTING.md
- [x] SECURITY.md
- [x] CODE_OF_CONDUCT.md
- [x] CHANGELOG.md
- [x] ROADMAP.md
- [x] .github Issue 模板（6个：bug_report, content_correction, new_technology, lab_request, feature_request, documentation）
- [x] .github PR 模板
- [x] 内容可信度标准文档 docs/content-standards.md

**已建设但未完成 ❌：**
- [ ] 内容状态字段落地到数据层（radar_items / sources / content_verifications）
- [ ] 第一个 Verified Lab — Secure MCP Server 和 Production Agent 均为 Draft 状态
- [ ] 第一期 AI Engineering Radar — 有后端 API（sample data）+ 前端页面，但未正式发布
- [ ] 审核现有 SDK 示例 / 修复错误接口
- [ ] 课程增加 lastVerifiedAt
- [ ] GitHub Topics（需在 GitHub 仓库设置）

### 新增模块（超越最小升级范围）

**Radar 模块：**
- 后端：`backend/api/radar_routes.py` — 3条 sample data，含分类/成熟度/来源/has_lab
- 前端：`frontend/src/app/radar/` — 列表页 + radar-client（加载/空/错误/分类筛选/来源展示）
- 前端 API：`frontend/src/app/api/radar/` — Next.js proxy 到后端
- 类型：`frontend/src/app/radar/radar-types.ts` + `frontend/src/lib/radar.ts`

**Labs 模块：**
- 前端：`frontend/src/app/labs/` — 列表页 + 详情页（含运行命令/状态/Difficulty/Cost）
- Lab 代码：`labs/secure-mcp-server/`（完整代码+metadata）和 `labs/production-agent-with-human-approval/`（完整代码+metadata）
- 状态：均为 Draft

### 启动项目遇到的问题

1. **端口冲突**：port 8000 被 Secure MCP Server lab 进程占用（可能被 Codex runtime 自动拉起），杀掉后自动复活
2. **后端缺 .env**：`backend/config.py` 用 `env_file = ".env"` 从 backend/ 目录加载，但 .env 在项目根目录。已创建 `backend/.env`
3. **后端启动成功**（日志显示 "Application startup complete."），但端口冲突导致实际请求打到了 MCP Server
4. **Neo4j**：Docker 正常运行
5. **前端**：未启动（等待后端就绪）

### 下一步

用户重启后：
1. 先确认 port 8000 干净（关掉 MCP Server lab 的自动拉起）
2. 启动后端 → 验证 `/radar/items` 返回数据
3. 启动前端 → 验证首页 + `/radar` + `/labs` 页面正常
4. 确认前后端打通（radar 页面从后端获取 sample data）
