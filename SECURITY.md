# 安全策略

AI Knowledge Atlas 同时是一个内容平台和一批可运行实验（Labs），因此安全既包括代码，也包括内容中给出的工程实践（尤其是 MCP、Agent 与 RAG 相关的安全示例）。

## 支持的版本

项目仍处于早期阶段，仅对最新的 `main` 分支提供安全修复。发布正式版本后会在此处补充版本支持矩阵。

## 报告安全漏洞

**请勿通过公开 Issue 报告安全漏洞。**

请通过以下方式私密报告：

- 使用 GitHub 的 [Private vulnerability reporting](https://github.com/guoHearts/AI-Knowledge-Atlas/security/advisories/new)（推荐）
- 或发送邮件至维护者（在 GitHub 主页 profile 获取联系方式）

报告时请尽量包含：

- 受影响的组件（frontend / backend / collectors / 某个 Lab）
- 复现步骤或 PoC
- 影响范围与严重程度评估
- 可能的修复建议（可选）

我们会在 **3 个工作日内**确认收到，并在评估后与你沟通处理时间表。

## 内容类安全问题

除代码漏洞外，以下内容问题也欢迎报告（可走普通 Issue 的 Content Correction 模板）：

- Lab 或示例中存在**误导性的安全实践**（例如把关键词过滤包装成完整的 Prompt Injection 防护）
- 示例代码泄露密钥、连接字符串或其他敏感信息
- 依赖项存在已知高危漏洞（`pnpm audit` / `pip-audit` 可发现）

## 安全基线

本项目内容与代码遵循以下基线，欢迎在审阅中据此提出问题：

- 禁止硬编码密码、密钥、连接字符串，一律走环境变量
- SQL 必须参数化，用户输入前后端双重校验
- Labs 中涉及外部工具调用（MCP / Agent Tools）必须有权限边界与审计说明
- 安全能力必须如实标注其局限，不得将实验性能力描述为生产级防护
