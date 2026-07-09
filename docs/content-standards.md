# 内容可信度标准

> 本文档定义 AI Knowledge Atlas 所有技术内容（Radar / Compare / Labs / 课程）必须遵守的可信度规范。
> 对应改造方案 §9、§10、§27。

项目的差异化不在"内容多"，而在"内容可信"。可信度靠三件事支撑：**来源可追溯、代码可运行、时间可核验**。

## 内容状态

所有文章、课程和实验统一使用以下四种状态：

| 状态 | 含义 |
|---|---|
| `Verified` | 已完成代码、版本和来源验证 |
| `Stale` | 依赖或接口发生变化，需要更新 |
| `Draft` | 内容未完成验证 |
| `Deprecated` | 技术或内容已不建议使用 |

状态流转规则（可由 CI 自动触发，见方案 §17.4）：

```text
90 天未验证        → 标记 Needs Review
依赖主版本升级      → 标记 Stale
官方 API 废弃       → 标记 Deprecated
Lab CI 失败         → 移除 Verified
```

## 自动过期检测

`backend/content_check` 提供一个静态校验脚本，统一扫描三类可信内容——Radar 条目、Labs 的
`metadata.yaml`、Compare（`docs/tech-comparisons/*.md`）的 Frontmatter——并按上述规则给出结论。

运行方式（任选其一）：

```bash
make content-check                      # 以今天为基准
make content-check ARGS="--strict"      # needs-review 也判失败

# Windows PowerShell
.\Make.ps1 content-check
.\scripts\check-content.ps1 --today 2026-07-09
```

当前已实现的检查：

| 规则 | 触发条件 | 级别 |
|---|---|---|
| `stale-needs-review` | `Verified` 且距 `lastVerifiedAt` 超过 90 天 | needs-review |
| `missing-status` | 状态不在 `Verified/Stale/Draft/Deprecated` | error |
| `missing-verification-date` | `Verified` 但缺少可解析的验证日期 | error |
| `missing-official-source` | `Verified` 但没有官方来源（`type` 以 `official` 开头） | error |
| `ci-failed-but-verified` | `Verified` 但 `ciStatus` 为 failing/failed | error |
| `missing-lab-path` | Lab 的 `path` 在磁盘上不存在 | error |

退出码：存在任一 error 即返回 `1`；`--strict` 下 needs-review 也返回 `1`；否则 `0`。
脚本**只检测、不改写**内容——`Stale`/`Deprecated` 的自动落状态是后续批次的工作。
`依赖主版本升级 → Stale` 与 `官方 API 废弃 → Deprecated` 依赖外部版本/接口信息，暂不在静态脚本范围内。

Draft/Deprecated 内容豁免 90 天过期规则，但仍会校验状态与必填元数据。Compare 的 `README.md`
是栏目索引而非文章，不参与文章级校验。

## 必填元数据

所有技术内容必须标注：

- 创建日期 `createdAt`
- 最后更新日期 `updatedAt`
- 最后验证日期 `lastVerifiedAt`
- 依赖版本 `packages`
- 模型版本 `models`
- 官方来源 `sources`
- 内容状态 `status`
- 已知限制
- 是否有可运行实验 `lab`

### 内容头信息示例（Markdown Frontmatter）

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

## 来源优先级

```text
官方文档 > 官方 GitHub > 官方博客 > 论文 > 权威技术团队 > 高质量社区讨论 > 普通转载
```

优先引用官方一手来源，不只引用二手转载文章。

## 禁止出现的问题

- 使用不存在的 SDK 接口
- 使用已经废弃的字段
- 代码无法编译 / 示例无法运行
- 使用模糊的"企业级""生产级"描述但没有依据
- 使用无法解释的评分
- 将关键词过滤包装成完整安全方案
- 只引用二手文章，不引用官方文档
- 不标注依赖版本 / 不标注更新时间
- 将实验性能力描述成稳定能力

## 内容发布流程

```text
选题 → 查阅官方来源 → 编写内容 → 实现最小实验 → 本地运行
→ 自动测试 → 人工审核 → 标记 Verified → 发布
```

## 内容审核 Checklist

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

## 数据结构参考

内容状态未来将落地到数据层（对应方案 §25），核心表：

- `radar_items`：雷达条目（含 `status`、`maturity`、`last_verified_at`）
- `sources`：来源（`content_type` / `content_id` / `source_type` / `url` / `verified_at`）
- `content_verifications`：验证记录（`verification_type` / `status` / `verified_at` / `verified_by`）
- `labs`：实验（`status` / `ci_status` / `last_verified_at`）

在数据层落地前，内容以 Markdown Frontmatter 承载上述字段。
