# 贡献指南

感谢你考虑为 AI Knowledge Atlas 做贡献。

本项目的核心不是"内容多"，而是"内容可信"。所以贡献的重点是：**来源可追溯、代码可运行、结论明确、标注验证时间**。哪怕只是补一个官方来源链接、修一个失效链接、给某个 Lab 加一份 Dockerfile，都是有价值的贡献。

## 你可以贡献什么

- **技术雷达（Radar）**：一条值得开发者关注的新模型 / 框架 / 论文 / 工程实践
- **技术选型（Compare）**：一篇给出明确结论的对比文章
- **可运行实验（Labs）**：一个版本锁定、一条命令启动、有预期输出的小型项目
- **知识图谱（Atlas）**：补充节点、关系、官方来源
- **学习路线（Learn）**：课程内容、练习题、常见错误、延伸阅读
- **可信度维护**：补来源、修失效链接、更新 `lastVerifiedAt`、修正过时接口
- **翻译**：中英文互译

不确定从哪里开始？看看标记为 `good first issue` 的 Issue。

## 提交流程

1. Fork 仓库，从 `main` 切出分支
2. 分支命名：`feat/<描述>`、`fix/<描述>`、`chore/<描述>`、`refactor/<描述>`、`docs/<描述>`
3. 提交信息使用 [Conventional Commits](https://www.conventionalcommits.org/)，描述用中文
4. 一个 PR 只做一件事，不混入无关改动；PR 超过 500 行请拆分
5. 推送前在本地跑通检查（见下）
6. 提交 PR，填写 PR 模板

**请勿直接推送到 `main`。**

## 本地开发

参见 [README](./README.md) 的启动方式。前后端与依赖服务的最小启动：

```bash
# 依赖服务（Neo4j）
docker compose up -d neo4j
# 后端
cd backend && python -m uvicorn main:app --reload
# 前端
cd frontend && pnpm dev
```

前端使用 **pnpm**（禁用 npm / yarn）。

## 代码规范

- 缩进 2 空格，LF 换行，单引号，无分号
- TypeScript strict，禁 `any`；注释说明 WHY 而非 WHAT
- UI 覆盖 loading / error / empty / success 四态；API 覆盖网络错误 / 超时 / 业务错误码 / 校验失败
- 交互元素需有 `aria-label` 或屏幕可读文本，键盘可达
- 禁止硬编码密钥，走环境变量；SQL 参数化

提交前请通过：

```bash
cd frontend && pnpm tsc --noEmit && pnpm lint && pnpm test
```

## 内容贡献规范

所有技术内容（Radar / Compare / Labs / 课程）必须满足 [内容可信度标准](./docs/content-standards.md)，核心要求：

- 引用**官方来源**（官方文档 / 官方 GitHub / 官方博客 / 论文优先于二手转载）
- 标注依赖版本、模型版本
- 标注 `createdAt` / `updatedAt` / `lastVerifiedAt` 与内容状态
- 给出**明确结论**：适合谁、不适合谁、成熟度、是否可运行
- 示例代码必须能编译、能运行，并记录预期输出
- 如实标注已知限制与安全风险

提交内容前请对照 [内容审核 Checklist](./docs/content-standards.md#内容审核-checklist)。

## Lab 贡献规范

每个 Lab 是一个可运行的小型项目，需包含：`README.md`、`metadata.yaml`、`.env.example`、固定依赖版本、一条启动命令、预期输入输出、常见失败场景、安全注意事项、官方来源、最后验证日期。目录规范见方案文档 §8。

## 行为准则

参与本项目即表示你同意遵守 [行为准则](./CODE_OF_CONDUCT.md)。
