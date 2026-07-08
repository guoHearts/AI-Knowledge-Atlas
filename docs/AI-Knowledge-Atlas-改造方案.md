# AI-Knowledge-Atlas 改造方案

> 面向 AI 开发者的持续更新技术雷达、技术选型地图与可运行实验平台  
> 文档版本：v1.0  
> 制定日期：2026-07-07

---

## 1. 改造目标

AI-Knowledge-Atlas 当前已经具备知识图谱、课程、资讯采集、Agent 学习路线、前后端平台等基础能力，但产品价值表达较分散。

本次改造的目标不是推倒重做，而是重新确定主次关系：

> **最新技术雷达是入口，可运行实验是信任，知识图谱是差异化，系统课程是长期沉淀。**

最终需要让用户在进入项目后的 30 秒内明确知道：

1. 这个项目是为谁服务的；
2. 它能帮开发者解决什么问题；
3. 它与普通 AI 资讯站、课程站、知识库有什么区别；
4. 为什么值得收藏、持续关注或 Star；
5. 如何立即运行一个真实示例。

---

## 2. 新产品定位

### 2.1 推荐定位

> **AI-Knowledge-Atlas 是一个面向 AI 开发者的持续更新技术雷达。它将新模型、新框架、新论文和新工程实践整理成来源可追溯的技术解读、选型地图和可运行实验。**

### 2.2 核心价值

项目需要重点回答以下问题：

- 最近有哪些 AI 技术真正值得关注？
- 一项新技术解决了什么问题？
- 它与已有方案相比有什么变化？
- 哪些场景适合使用？
- 哪些场景不适合使用？
- 是否已经适合生产环境？
- 如何快速运行和验证？
- 它与其他技术、框架、模型之间是什么关系？

### 2.3 目标用户

#### 主要用户

- AI 应用开发者
- 后端开发者
- 全栈开发者
- Agent 开发者
- RAG 开发者
- AI 平台工程师
- 想转向 AI Engineering 的传统开发者

#### 次要用户

- 技术负责人
- AI 产品经理
- 架构师
- 技术内容创作者
- 高校学生和研究人员

### 2.4 不再重点强调的定位

以下能力可以保留，但不应成为首页第一卖点：

- 企业 AI 能力成熟度评分
- 泛化的企业数字化建设规划
- 没有明确计算依据的能力雷达
- 过于宏大的平台架构表述
- 只展示概念、不帮助用户完成技术决策的知识图谱

---

## 3. 产品主路径

新的产品主路径应统一为：

```text
发现新技术
    ↓
筛选是否值得关注
    ↓
解释为什么重要
    ↓
与现有方案进行对比
    ↓
提供可运行实验
    ↓
连接到知识图谱
    ↓
沉淀到学习路线
```

用户进入网站后，应优先看到“最新变化”和“可运行成果”，而不是先看到课程目录或平台架构。

---

## 4. 产品信息架构

建议将产品重构为五个一级模块。

```text
AI-Knowledge-Atlas
├── Radar          AI 技术雷达
├── Compare        技术选型与对比
├── Labs           可运行实验
├── Atlas          知识图谱
└── Learn          系统学习路线
```

---

## 5. 首页改造

### 5.1 首页目标

首页需要在最短时间内完成三件事：

1. 说明项目是什么；
2. 展示最近最有价值的内容；
3. 引导用户运行实验或查看选型结论。

### 5.2 推荐首页结构

#### 第一屏：项目定位

建议文案：

```text
AI Knowledge Atlas

持续更新、来源可追溯、代码可运行的 AI 工程技术雷达。

发现值得关注的新模型、新框架和新工程实践，
理解它们为什么重要，并通过可运行实验快速验证。
```

主要按钮：

- 查看本周技术雷达
- 运行第一个实验
- 浏览技术选型地图
- GitHub Star

第一屏可增加以下可信度信息：

```text
XX 个已验证实验
XX 个技术节点
XX 个官方来源
最后更新：2026-07-07
```

这些数字必须由系统真实计算，不使用无法解释的装饰性评分。

---

#### 第二屏：本周 AI Engineering Radar

每周精选 5～10 项内容，不追求数量，强调判断。

每条内容展示：

```text
标题
分类
一句话结论
为什么重要
成熟度
适合谁
是否有实验
来源
更新时间
```

示例：

```text
Claude Agent SDK 更新

结论：
适合构建需要工具调用、上下文管理和长期任务执行的 Claude Agent。

为什么重要：
官方正在将 Agent 能力从通用 API 调用提升到更完整的工程工具链。

成熟度：
Early Production

适合：
Claude 生态、Coding Agent、复杂工具链任务

谨慎使用：
强跨模型兼容场景
```

---

#### 第三屏：技术选型

建议展示高频决策问题：

- LangGraph、OpenAI Agents SDK、Claude Agent SDK 怎么选？
- MCP、Function Calling、REST API 怎么选？
- 向量 RAG、混合检索、GraphRAG 怎么选？
- 闭源模型、开源模型、自托管模型怎么选？
- Workflow 和 Autonomous Agent 怎么选？

每个卡片应直接给出结论，而不是只有入口。

---

#### 第四屏：Verified Labs

展示 3～6 个标杆实验：

- Production Agent with Human Approval
- Hybrid RAG with Evaluation
- Secure MCP Server
- Multimodal Document Agent
- Coding Agent Sandbox
- Agent Observability Starter

每个实验展示：

- 难度
- 技术栈
- 预计运行时间
- 是否需要 API Key
- 预估调用成本
- CI 状态
- 最后验证日期

---

#### 第五屏：知识图谱

知识图谱展示应围绕用户问题，而不是只展示节点。

推荐入口：

- 查看 Agent 技术演进关系
- 查看 RAG 技术栈
- 查看 MCP 生态
- 查看模型与框架依赖关系
- 查看某项技术替代了什么
- 查看某项技术可以和什么组合

---

#### 第六屏：学习路线

学习路线放在首页靠后位置。

推荐路线：

- AI Engineering 基础
- Agent Engineering
- RAG Engineering
- MCP 与工具生态
- LLM Evaluation
- LLMOps 与生产部署
- 多模态应用
- AI Security

---

## 6. 技术雷达设计

### 6.1 雷达分类

建议固定以下分类：

```text
Models
Agents
RAG
MCP
Evals
LLMOps
Multimodal
Coding
Security
Research
Infrastructure
```

### 6.2 技术成熟度

建议使用统一成熟度标签：

```text
Experimental
Early Adoption
Production Ready
Mature
Declining
```

定义：

| 状态 | 含义 |
|---|---|
| Experimental | 研究或早期原型阶段 |
| Early Adoption | 已有人使用，但接口和生态仍不稳定 |
| Production Ready | 已具备较完整生产能力 |
| Mature | 生态稳定，最佳实践明确 |
| Declining | 正在被新方案替代或维护活跃度下降 |

### 6.3 每条雷达内容的数据结构

```yaml
id: claude-agent-sdk-2026-07
title: Claude Agent SDK 更新
slug: claude-agent-sdk-update
category: Agents
status: Early Adoption
publishedAt: 2026-07-07
lastVerifiedAt: 2026-07-07

summary: >
  Claude 官方 Agent SDK 更新了工具调用与任务执行能力。

whyItMatters:
  - 更适合构建 Claude 原生 Agent
  - 提供更完整的工具调用封装
  - 影响原有 Anthropic SDK 的选型

recommendedFor:
  - Coding Agent
  - Claude 原生应用
  - 多工具任务执行

notRecommendedFor:
  - 强跨模型兼容平台
  - 极低延迟简单调用

sources:
  - type: official
    title: Official documentation
    url: https://...

relatedLabs:
  - claude-agent-sdk-basic

relatedNodes:
  - Claude
  - Agent SDK
  - Tool Calling
```

---

## 7. 技术选型地图

### 7.1 选型内容必须回答的问题

每篇选型文章至少回答：

1. 对比对象分别是什么；
2. 它们的核心设计差异；
3. 各自最适合什么场景；
4. 各自最不适合什么场景；
5. 学习成本；
6. 生产成熟度；
7. 模型兼容性；
8. 可观测性；
9. 状态管理能力；
10. 部署复杂度；
11. 最终推荐结论。

### 7.2 推荐内容模板

```markdown
# LangGraph vs OpenAI Agents SDK vs Claude Agent SDK

## 一句话结论

## 对比对象

## 核心架构差异

## 功能矩阵

## 典型场景

## 不适用场景

## 生产能力

## 学习和迁移成本

## 推荐决策树

## 可运行实验

## 官方来源

## 最后验证日期
```

### 7.3 决策树示例

```text
是否需要跨模型？
├── 是
│   ├── 是否需要复杂状态图？
│   │   ├── 是 → LangGraph
│   │   └── 否 → 自定义轻量封装
│
└── 否
    ├── 主要使用 OpenAI？
    │   └── OpenAI Agents SDK
    ├── 主要使用 Claude？
    │   └── Claude Agent SDK
```

---

## 8. Verified Labs 体系

### 8.1 Labs 的定位

Labs 是项目最重要的信任资产。

每个 Lab 不是简单代码片段，而是一个可运行、可验证、可维护的小型项目。

### 8.2 每个 Lab 必须具备

- 清晰的业务目标
- 固定依赖版本
- 环境变量示例
- 一条命令启动
- 预期输入输出
- 运行截图或 GIF
- 常见失败场景
- 安全注意事项
- 调用成本说明
- 官方资料来源
- CI 验证状态
- 最后验证日期
- 对应技术图谱节点
- 对应学习内容

### 8.3 推荐目录

```text
labs/
├── production-agent/
│   ├── README.md
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── backend/
│   ├── frontend/
│   ├── tests/
│   └── metadata.yaml
│
├── hybrid-rag-evaluation/
├── secure-mcp-server/
├── multimodal-document-agent/
└── coding-agent-sandbox/
```

### 8.4 Lab 元数据

```yaml
id: secure-mcp-server
title: Secure MCP Server
status: verified
difficulty: intermediate
lastVerifiedAt: 2026-07-07

estimatedSetupTime: 15min
estimatedCost: "< $1"
requiresApiKey: true

stack:
  - Python
  - FastAPI
  - MCP
  - Pydantic

features:
  - Tool allowlist
  - Parameter validation
  - Audit logging
  - Permission boundary
  - Prompt injection defense

commands:
  install: uv sync
  run: uv run python main.py
  test: uv run pytest

sources:
  - type: official
    url: https://...
```

---

## 9. 内容可信度机制

### 9.1 内容状态

所有文章、课程和实验统一使用以下状态：

```text
Verified
Stale
Draft
Deprecated
```

定义：

| 状态 | 含义 |
|---|---|
| Verified | 已完成代码、版本和来源验证 |
| Stale | 依赖或接口发生变化，需要更新 |
| Draft | 内容未完成验证 |
| Deprecated | 技术或内容已不建议使用 |

### 9.2 所有技术内容必须标注

- 创建日期
- 最后更新日期
- 最后验证日期
- 依赖版本
- 模型版本
- 官方来源
- 内容状态
- 已知限制
- 是否有可运行实验

### 9.3 内容头信息示例

```yaml
---
title: Claude Agent SDK 入门
status: verified
createdAt: 2026-07-01
updatedAt: 2026-07-07
lastVerifiedAt: 2026-07-07

packages:
  "@anthropic-ai/claude-agent-sdk": "x.y.z"

models:
  - claude-xxx

sources:
  - type: official-doc
    url: https://...

lab:
  path: labs/claude-agent-sdk-basic
---
```

---

## 10. 内容审核规范

### 10.1 禁止出现的问题

- 使用不存在的 SDK 接口
- 使用已经废弃的字段
- 代码无法编译
- 示例无法运行
- 使用模糊的“企业级”“生产级”描述但没有依据
- 使用无法解释的评分
- 将关键词过滤包装成完整安全方案
- 只引用二手文章，不引用官方文档
- 不标注依赖版本
- 不标注更新时间
- 将实验性能力描述成稳定能力

### 10.2 内容发布流程

```text
选题
  ↓
查阅官方来源
  ↓
编写内容
  ↓
实现最小实验
  ↓
本地运行
  ↓
自动测试
  ↓
人工审核
  ↓
标记 Verified
  ↓
发布
```

### 10.3 内容审核 Checklist

```markdown
- [ ] 是否引用了官方文档
- [ ] 是否标明依赖版本
- [ ] 是否标明模型版本
- [ ] 示例是否可以编译
- [ ] 示例是否可以运行
- [ ] 是否记录预期输出
- [ ] 是否说明适用场景
- [ ] 是否说明不适用场景
- [ ] 是否说明已知限制
- [ ] 是否说明安全风险
- [ ] 是否标记最后验证日期
- [ ] 是否连接到相关图谱节点
```

---

## 11. 知识图谱改造

### 11.1 知识图谱的新角色

知识图谱不再只是展示概念，而是用于回答技术决策问题。

### 11.2 推荐节点类型

```text
Model
Framework
SDK
Protocol
Technique
Paper
Company
Tool
Benchmark
Dataset
UseCase
Risk
Lab
Course
Article
```

### 11.3 推荐关系类型

```text
USES
DEPENDS_ON
REPLACES
ALTERNATIVE_TO
COMPATIBLE_WITH
IMPLEMENTS
INTRODUCED_BY
EVALUATED_BY
SUITABLE_FOR
NOT_SUITABLE_FOR
HAS_RISK
EXPLAINED_BY
VERIFIED_BY
```

### 11.4 示例

```text
LangGraph
  ├── ALTERNATIVE_TO → OpenAI Agents SDK
  ├── SUITABLE_FOR → Stateful Agent Workflow
  ├── DEPENDS_ON → LangChain Ecosystem
  ├── VERIFIED_BY → Production Agent Lab
  └── HAS_RISK → Complexity
```

### 11.5 图谱页面必须支持

- 搜索节点
- 查看上下游关系
- 查看替代方案
- 查看相关实验
- 查看相关课程
- 查看成熟度
- 查看最近更新时间
- 查看官方来源
- 按场景筛选
- 按技术栈筛选
- 按成熟度筛选

---

## 12. 学习路线改造

### 12.1 学习路线的角色

学习路线用于沉淀长期有效的知识，不负责承载所有最新新闻。

### 12.2 内容分层

```text
Foundation
Core Engineering
Production
Advanced
Frontier
```

### 12.3 推荐路线

#### AI Engineering Foundation

- LLM 基础
- Prompt 基础
- API 调用
- Structured Output
- Tool Calling
- Embedding
- Vector Database

#### Agent Engineering

- Workflow
- Agent Loop
- State Management
- Tool System
- Memory
- Human in the Loop
- Multi-Agent
- Agent Evaluation
- Agent Security

#### RAG Engineering

- Chunking
- Embedding
- Retrieval
- Hybrid Search
- Rerank
- Query Rewrite
- GraphRAG
- Citation
- RAG Evaluation

#### Production AI

- Observability
- Tracing
- Cost Control
- Caching
- Rate Limit
- Retry
- Timeout
- Fallback
- Deployment
- Security

### 12.4 每节课程必须增加

- 前置知识
- 学习目标
- 预计时长
- 对应实验
- 官方来源
- 最后验证日期
- 内容状态
- 练习题
- 常见错误
- 延伸阅读

---

## 13. 数据采集与筛选流程

### 13.1 数据来源

可保留现有采集器：

- GitHub Trending
- GitHub Release
- arXiv
- Hugging Face
- Hacker News
- 官方博客
- RSS
- 技术社区
- 官方文档更新

### 13.2 不建议直接做资讯聚合

采集到的数据不应原样展示。

需要经过：

```text
采集
  ↓
去重
  ↓
分类
  ↓
来源可信度评分
  ↓
开发者相关性评分
  ↓
技术影响判断
  ↓
人工审核
  ↓
发布
```

### 13.3 推荐评分维度

```text
Source Trust
Developer Relevance
Technical Novelty
Production Impact
Adoption Signal
Reproducibility
```

### 13.4 推荐内容筛选原则

优先发布：

- 官方重大版本
- 会改变开发方式的接口更新
- 生产能力明显提升
- 新增重要安全或评测能力
- 开源生态快速增长
- 有可复现代码
- 对现有选型有直接影响

降低优先级：

- 纯融资新闻
- 只有宣传稿、没有技术细节
- 重复发布
- 无法验证的性能声明
- 只适合研究、但没有明确工程价值的内容
- 单纯模型排行榜变化

---

## 14. 仓库结构建议

```text
AI-Knowledge-Atlas/
├── README.md
├── README.zh-CN.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── ROADMAP.md
│
├── frontend/
├── backend/
├── collectors/
├── graph/
├── docs/
│   ├── radar/
│   ├── comparisons/
│   ├── architecture/
│   └── contribution/
│
├── labs/
├── content/
│   ├── courses/
│   ├── radar/
│   └── comparisons/
│
├── scripts/
│   ├── validate-content/
│   ├── check-links/
│   └── verify-labs/
│
└── .github/
    ├── ISSUE_TEMPLATE/
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/
```

---

## 15. README 改造

### 15.1 README 第一屏

建议使用：

```markdown
# AI Knowledge Atlas

持续更新、来源可追溯、代码可运行的 AI 工程技术雷达。

AI Knowledge Atlas 帮助开发者理解快速变化的 AI 工程生态，并把新模型、新框架和新实践转化为：

- 每周精选的 AI Engineering Radar
- 面向真实场景的技术选型地图
- 经过版本锁定和运行验证的代码实验
- Agents、RAG、MCP、Evals、LLMOps 与多模态学习路线
- 可探索技术关系与演进路径的知识图谱

## 你可以在这里解决什么问题？

- 最近有哪些 AI 技术真正值得关注？
- 不同 Agent 框架应该如何选择？
- 一个新方案是否已经适合生产环境？
- 如何用最小代码验证论文或框架的能力？
- 一项技术与已有模型、工具和工程模式有什么关系？

> 不只告诉你出现了什么，还会说明为什么重要、何时使用，以及如何运行。
```

### 15.2 README 推荐结构

```text
项目定位
核心功能
30 秒演示
快速开始
本周技术雷达
标杆实验
技术选型
知识图谱
学习路线
项目架构
Roadmap
贡献方式
内容可信度
社区
License
```

### 15.3 必须补充的视觉内容

- 首页截图
- 技术雷达截图
- 知识图谱截图
- Lab 运行 GIF
- 架构图
- 数据流程图
- Social Preview

---

## 16. 开源治理

### 16.1 必须增加的文件

```text
LICENSE
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
CHANGELOG.md
ROADMAP.md
```

### 16.2 Issue 模板

建议增加：

```text
Bug Report
Content Correction
New Technology Request
Lab Request
Feature Request
Documentation Issue
```

### 16.3 Content Correction 模板

```markdown
## 内容位置

## 当前问题

## 官方来源

## 建议修改

## 是否愿意提交 PR
```

### 16.4 Good First Issue

第一批可开放：

- 补充某个技术节点的官方来源
- 修复失效链接
- 为某个 Lab 增加 Dockerfile
- 增加中文或英文翻译
- 为课程增加最后验证日期
- 增加截图或运行结果
- 补充某个框架的对比项
- 增加一个小型测试

---

## 17. CI/CD 改造

### 17.1 建议工作流

```text
frontend-build.yml
backend-test.yml
labs-verify.yml
content-validate.yml
link-check.yml
dependency-watch.yml
security-scan.yml
release.yml
```

### 17.2 内容验证

CI 自动检查：

- Markdown Frontmatter
- 必填字段
- 来源链接
- 最后验证日期
- 内容状态
- Lab 路径是否存在
- 图谱节点是否存在
- 代码块基本语法
- 失效链接

### 17.3 Labs 验证

对每个 Lab：

- 安装依赖
- 编译
- 运行单元测试
- 运行 smoke test
- 检查环境变量模板
- 检查 README
- 检查元数据
- 输出验证徽章

### 17.4 过期检测

建议规则：

```text
90 天未验证 → 标记 Needs Review
依赖主版本升级 → 标记 Stale
官方 API 废弃 → 标记 Deprecated
CI 失败 → 移除 Verified
```

---

## 18. 第一批标杆实验

### 18.1 Production Agent

功能：

- Tool Calling
- Structured Output
- Retry
- Timeout
- Human Approval
- Memory
- Tracing
- Cost Logging

目标：

> 展示一个真正可以继续扩展到生产环境的 Agent，而不是简单聊天 Demo。

---

### 18.2 Hybrid RAG Evaluation

功能：

- 向量检索
- BM25
- Hybrid Search
- Rerank
- Citation
- Dataset
- 自动评测
- 检索指标
- 回答质量指标

目标：

> 展示 RAG 不只是“接一个向量数据库”，而是完整的检索与评测流程。

---

### 18.3 Secure MCP Server

功能：

- Tool Allowlist
- 参数校验
- 权限隔离
- 审计日志
- Prompt Injection 防护
- 超时控制
- 资源限制

目标：

> 展示 MCP 在真实工程环境中的安全边界。

---

## 19. Star 增长策略

### 19.1 核心原则

不要主要宣传“我做了一个平台”。

应持续发布可以单独传播的成果：

- 一张技术选型图
- 一个完整实验
- 一篇深度对比
- 一份每周技术雷达
- 一个真实问题的工程解决方案
- 一个易踩坑的版本迁移说明

### 19.2 可传播内容标题示例

```text
我把 LangGraph、OpenAI Agents SDK 和 Claude Agent SDK 做成了三个可运行实验

RAG 最大的问题不是检索，而是你根本没有评测

MCP Server 上生产前必须补齐的 8 个安全能力

一个 Production Agent 至少需要哪些模块

本周最值得 AI 开发者关注的 5 个技术变化

为什么很多 Prompt Injection 防护实际上没有效果
```

### 19.3 发布渠道

国内：

- 掘金
- 知乎
- CSDN
- 公众号
- B 站
- 小红书
- 抖音
- 开源中国
- V2EX

海外：

- Reddit
- Hacker News
- X
- LinkedIn
- Dev.to
- Medium
- Product Hunt
- GitHub Discussions

### 19.4 每次发布的标准结构

```text
真实问题
  ↓
结论
  ↓
对比或实验
  ↓
代码和截图
  ↓
仓库入口
  ↓
下一步计划
```

### 19.5 不建议的做法

- 到处复制“欢迎 Star”
- 只发项目截图
- 只描述技术架构
- 没有 Demo 就发布
- 内容没有明确结论
- 使用夸张标题但缺乏实验
- 一次性发布后长期不更新
- 过早追求大而全

---

## 20. GitHub 页面优化

### 20.1 Topics

建议：

```text
ai-engineering
ai-agents
agentic-ai
rag
mcp
llmops
llm-evaluation
graph-rag
knowledge-graph
generative-ai
fastapi
nextjs
neo4j
```

### 20.2 Description

建议：

```text
A continuously updated AI engineering radar with verified labs, technology comparisons, learning paths, and a knowledge graph.
```

中文版本：

```text
持续更新、来源可追溯、代码可运行的 AI 工程技术雷达。
```

### 20.3 Social Preview

建议包含：

```text
AI Knowledge Atlas
AI Engineering Radar
Verified Labs
Technology Comparisons
Knowledge Graph
```

不要堆过多文字，优先突出项目名称和三个核心能力。

### 20.4 Release

第一版建议：

```text
v0.1.0 — Positioning Reset
```

内容包括：

- 新 README
- 新首页
- 第一份 Radar
- 第一个 Verified Lab
- 内容状态系统
- 贡献指南
- Roadmap

---

## 21. 30 天执行计划

## 第 1 周：定位和可信度

### 目标

完成项目定位重构，修复影响信任的问题。

### 任务

```markdown
- [ ] 重写 README 第一屏
- [ ] 明确项目一句话定位
- [ ] 删除或弱化无法解释的企业能力评分
- [ ] 审核现有 SDK 示例
- [ ] 修复错误或过时接口
- [ ] 为课程增加 lastVerifiedAt
- [ ] 为内容增加 Verified、Stale、Draft 状态
- [ ] 添加 LICENSE
- [ ] 添加 CONTRIBUTING.md
- [ ] 添加 SECURITY.md
- [ ] 添加 CODE_OF_CONDUCT.md
- [ ] 添加 CHANGELOG.md
- [ ] 添加 ROADMAP.md
- [ ] 开放 Issues 和 Discussions
- [ ] 添加 Issue 模板
- [ ] 添加 GitHub Topics
```

### 验收标准

- 用户进入 README 后 30 秒内知道项目解决什么问题；
- 所有首页核心指标均可解释；
- 抽查的技术内容不存在明显错误接口；
- 外部用户可以正常提交 Issue 和 PR；
- 项目许可证明确。

---

## 第 2 周：标杆内容

### 目标

完成三个可以独立传播的内容资产。

### 任务

```markdown
- [ ] 完成 Agent SDK 技术对比
- [ ] 完成 Production Agent Lab
- [ ] 完成 Hybrid RAG Evaluation Lab
- [ ] 完成 Secure MCP Server Lab
- [ ] 为每个 Lab 增加 README
- [ ] 为每个 Lab 增加一键运行命令
- [ ] 为每个 Lab 增加预期输出
- [ ] 为每个 Lab 增加 CI
- [ ] 为每个 Lab 增加运行截图或 GIF
```

### 验收标准

- 三个 Lab 均可在新环境中运行；
- 依赖版本固定；
- CI 通过；
- 文档包含适用和不适用场景；
- 每个 Lab 均有独立传播价值。

---

## 第 3 周：技术雷达

### 目标

上线第一版 AI Engineering Radar。

### 任务

```markdown
- [ ] 设计 Radar 数据结构
- [ ] 完成分类和成熟度定义
- [ ] 增加 Radar 列表页
- [ ] 增加 Radar 详情页
- [ ] 发布第一期周报
- [ ] 每条内容引用官方来源
- [ ] 每条内容标注技术影响
- [ ] 每条内容标注推荐用户
- [ ] 每条内容关联 Lab 或图谱
```

### 验收标准

- 第一周只精选 5～10 项；
- 每条内容都有明确结论；
- 不只是新闻摘要；
- 用户可以通过雷达进入实验、图谱或课程。

---

## 第 4 周：首页和发布

### 目标

完成首页重构并进行第一次集中发布。

### 任务

```markdown
- [ ] 完成新首页
- [ ] 制作 30 秒 Demo GIF
- [ ] 制作 Social Preview
- [ ] 发布 v0.1.0
- [ ] 编写中文发布文章
- [ ] 编写英文发布文章
- [ ] 发布技术选型图
- [ ] 发布第一个 Lab 介绍
- [ ] 发布第一期 Radar
- [ ] 建立更新节奏
```

### 验收标准

- 首页主路径清晰；
- GitHub 仓库具备基础社区文件；
- 至少有一个可运行实验可直接体验；
- 有明确 Release；
- 有后续更新计划。

---

## 22. 90 天路线图

### 第 1 月：完成定位重构

- 新首页
- 新 README
- 三个 Labs
- 一期 Radar
- 内容可信度系统
- 基础开源治理

### 第 2 月：形成持续更新能力

- 每周 Radar
- 每两周一个新 Lab
- 技术选型栏目
- 内容过期检测
- 图谱关系完善
- 第一批外部贡献者

### 第 3 月：形成社区和品牌

- 多语言支持
- Newsletter
- Discord 或微信群
- 外部作者贡献
- 技术专题
- 榜单和趋势
- 公开内容 API
- 项目 Showcase

---

## 23. 关键指标

### 23.1 不建议只看 Star

Star 是结果，不是唯一目标。

建议同时跟踪：

```text
Weekly Active Users
Returning Visitors
Lab Runs
README → Demo Click Rate
Radar → Lab Conversion
Issue Count
PR Count
External Contributors
Content Verification Rate
Stale Content Ratio
Newsletter Subscribers
GitHub Stars
GitHub Forks
```

### 23.2 第一阶段目标

可设置为：

```text
30 天
- 3 个 Verified Labs
- 4 期 Radar 或至少 1 期高质量 Radar
- 10 个技术选型内容
- 100% 核心内容有最后验证日期
- 0 个已知无法运行的标杆示例
- 10 个 Good First Issues
- 第一批外部贡献
```

Star 数量不应脱离内容产出单独设定。

---

## 24. 页面开发优先级

### P0

- README
- 首页第一屏
- Radar 列表
- Radar 详情
- Labs 列表
- Lab 详情
- 内容状态
- 最后验证日期
- 官方来源
- GitHub 社区文件

### P1

- 技术对比页
- 图谱筛选
- 学习路线重构
- 收藏
- 内容搜索
- 内容过期提醒
- CI 状态展示

### P2

- 用户账号
- 学习进度
- Newsletter
- 评论
- 推荐系统
- 个性化路线
- 多语言
- 公共 API

---

## 25. 数据库建议

可根据现有数据库适配以下核心实体。

```text
radar_items
technologies
technology_relations
comparisons
labs
lab_runs
courses
lessons
sources
content_versions
content_verifications
users
favorites
learning_progress
```

### radar_items

```text
id
title
slug
summary
category
maturity
why_it_matters
recommended_for
not_recommended_for
published_at
last_verified_at
status
```

### sources

```text
id
content_type
content_id
source_type
title
url
publisher
published_at
verified_at
```

### content_verifications

```text
id
content_type
content_id
verification_type
status
details
verified_at
verified_by
```

### labs

```text
id
title
slug
difficulty
status
repository_path
estimated_setup_time
estimated_cost
requires_api_key
last_verified_at
ci_status
```

---

## 26. API 建议

```text
GET /api/radar
GET /api/radar/{slug}

GET /api/technologies
GET /api/technologies/{slug}
GET /api/technologies/{slug}/relations

GET /api/comparisons
GET /api/comparisons/{slug}

GET /api/labs
GET /api/labs/{slug}
POST /api/labs/{slug}/run-events

GET /api/courses
GET /api/courses/{slug}

GET /api/search
GET /api/sources/{contentType}/{contentId}
```

---

## 27. 设计原则

### 27.1 先给结论，再给过程

每个页面优先展示：

```text
一句话结论
适合谁
不适合谁
成熟度
是否可运行
```

### 27.2 少而可信

宁可一周发布 5 条高质量内容，也不要发布 100 条自动摘要。

### 27.3 代码优先

对开发者而言，运行结果比概念说明更有说服力。

### 27.4 来源优先

优先级：

```text
官方文档
官方 GitHub
官方博客
论文
权威技术团队
高质量社区讨论
普通转载
```

### 27.5 明确时间

所有技术内容都要说明：

- 什么时候发布；
- 什么时候更新；
- 什么时候验证；
- 当前是否仍然有效。

---

## 28. 最终验收问题

改造完成后，应能对以下问题全部回答“是”。

```markdown
- [ ] 用户能否在 30 秒内理解项目定位？
- [ ] 首页是否首先展示最新技术和可运行实验？
- [ ] 每篇技术内容是否有明确结论？
- [ ] 每篇内容是否有官方来源？
- [ ] 每篇内容是否有最后验证日期？
- [ ] 标杆代码是否真实可运行？
- [ ] 是否能区分 Verified 和 Stale？
- [ ] 知识图谱是否帮助用户做技术决策？
- [ ] 学习路线是否沉淀长期知识？
- [ ] 是否有至少三个可传播的项目成果？
- [ ] 外部用户是否容易提交 Issue 和 PR？
- [ ] 是否有明确 License？
- [ ] 是否有 Release？
- [ ] 是否有持续更新机制？
- [ ] 是否能通过 CI 发现内容过期？
```

---

## 29. 最重要的执行顺序

不要同时改所有模块。

按照以下顺序推进：

```text
1. 修复错误内容
2. 重写项目定位
3. 重写 README
4. 增加内容状态和验证日期
5. 做一个高质量 Lab
6. 上线第一期 Radar
7. 改造首页
8. 完善知识图谱
9. 重构学习路线
10. 做社区和推广
```

当前最重要的不是增加更多课程，而是建立可信度和形成一个可以持续发布的核心产品。

---

## 30. 项目最终形态

改造完成后，AI-Knowledge-Atlas 应形成以下闭环：

```text
自动发现变化
    ↓
人工和 AI 协同筛选
    ↓
形成技术雷达
    ↓
输出技术选型结论
    ↓
制作可运行实验
    ↓
进入知识图谱
    ↓
沉淀为系统课程
    ↓
通过社区反馈继续更新
```

最终用户对项目的认知应该是：

> 当我想了解最近 AI 开发领域发生了什么、某项技术是否值得学、应该如何选型，以及怎样快速运行验证时，我会打开 AI-Knowledge-Atlas。

