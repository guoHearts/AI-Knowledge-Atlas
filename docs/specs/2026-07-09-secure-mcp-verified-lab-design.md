# Secure MCP Server Verified Lab 设计

## 背景

项目当前已完成 README、首页入口、Radar 最小闭环和 Labs 元数据后端化。路线图下一项是完成第一个高质量 Verified Lab，候选实验为 `labs/secure-mcp-server`。

本批不重写实验工程，不新增新的 MCP Server 示例。目标是把已有 Secure MCP Server 实验提升为可展示、可核验、可与 Radar / Graph / Learn 串联的内容资产。

## 目标

1. 将 Secure MCP Server 标记为首个 `Verified` Lab。
2. 补齐 Verified Lab 必须展示的可信度字段：最后验证日期、官方来源、依赖版本、预期输出、常见失败场景、安全注意事项、已知限制和关联路径。
3. 让 Labs 详情页可以展示这些证据，而不是只显示运行命令。
4. 用测试保护 Verified Lab 的必填字段，避免后续新增 Lab 时退回到只有标题和命令的弱元数据。
5. 更新项目进度文档，说明第一个 Verified Lab 已完成内容闭环。

## 非目标

1. 不扩展 MCP Server 的工具能力。
2. 不引入新的 MCP SDK 或运行时依赖。
3. 不新增独立演示前端、截图或 GIF。
4. 不把 Labs 数据迁出当前后端 `learning catalog`。
5. 不建立完整 CI 工作流；本批只记录当前可运行验证命令和本地测试结果。

## 数据模型

在现有 `LabDefinition` 基础上扩展字段：

- `lastVerifiedAt`：最后验证日期，使用 `YYYY-MM-DD`。
- `packages`：固定依赖版本列表，来自实验 `requirements.txt`。
- `sources`：官方来源列表，至少包含 MCP specification、FastAPI、Pydantic。
- `expectedOutputs`：本地验证后应看到的关键输出，例如测试通过、健康检查返回、未授权工具被拒绝。
- `failureModes`：常见失败场景和处理建议。
- `securityNotes`：安全边界说明，明确 allowlist、参数校验、审计日志不是完整生产安全方案。
- `knownLimitations`：已知限制，例如示例 API key、未内置 rate limiting、没有生产身份系统。
- `relatedRadarItemIds`：关联 `mcp-security-boundary-2026-07`。
- `relatedNodeIds`：关联 `MCP`、`Tool Allowlist`、`Prompt Injection`。
- `relatedLearningPaths`：关联 MCP 学习路径。

`production-agent-with-human-approval` 仍保持 Draft，但需要兼容扩展后的类型。Draft Lab 不强制具备完整 Verified 字段。

## 页面设计

Labs 列表页保持现有结构，只需要正确显示 `Verified` 状态。详情页增加以下信息区：

1. 验证摘要：状态、难度、预计时间、最后验证日期、成本、是否需要 API key。
2. 本地验证命令：保留现有命令块。
3. 预期输出：列出用户运行测试或启动服务后应该看到的结果。
4. 官方来源：显示来源标题和链接。
5. 常见失败场景：帮助用户判断环境变量、依赖安装、端口冲突等问题。
6. 安全注意事项与已知限制：避免把示例误解为完整生产安全方案。
7. 关联路径：指向 Radar、Graph 或 Learn 的后续入口。

页面不引入新的交互状态；Labs 数据仍由后端 API 返回，Next.js 页面继续只负责路由和渲染。

## 测试策略

先写失败测试，再实现：

1. 后端 `LearningService` 测试：`secure-mcp-server` 为 `Verified` 时必须包含 `lastVerifiedAt`、官方来源、预期输出、安全注意事项、关联 Radar、Graph 和 Learn 路径。
2. 前端 Labs API 测试：mock 后端返回扩展字段，确认 `listLabs` / `getLabById` 能保留这些字段。
3. TypeScript 类型检查：确保详情页使用的字段在 `LabDefinition` 中声明。
4. 实验本身验证：运行 `labs/secure-mcp-server` 的 pytest，确认已有实验仍可运行。

## 文档更新

同步更新：

- `labs/secure-mcp-server/metadata.yaml`
- `labs/secure-mcp-server/README.md`
- `memory/roadmap-progress.md`
- 必要时更新 `memory/reform-progress.md` 或 `memory/session-progress-2026-07-08.md`

README 要修复明显乱码，并补齐 Verified 准入信息：依赖版本、运行命令、预期输出、常见失败、安全边界、官方来源、最后验证日期。

## 风险与取舍

当前实验已有代码和测试，但尚未接入真实 CI。把 Lab 标记为 `Verified` 的依据是本地命令、固定依赖和官方来源，而不是远端流水线。页面和 README 必须明确这一点，避免把“本地已验证”包装成“生产部署已验证”。

本批选择保留 `learning catalog` 作为数据源，是因为 Labs 元数据刚完成后端化，继续沿用现有边界比新增内容系统更稳。等第二、第三个 Lab 出现后，再评估是否抽出独立 Labs catalog 或内容文件格式。
