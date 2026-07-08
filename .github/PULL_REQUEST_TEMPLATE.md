<!-- 一个 PR 只做一件事。请填写以下内容，并勾选适用的检查项。 -->

## 变更类型

- [ ] 代码（feat / fix / refactor / chore）
- [ ] 内容（Radar / Compare / Lab / 课程）
- [ ] 文档
- [ ] 可信度维护（补来源 / 修链接 / 更新验证日期）

## 变更说明

<!-- 做了什么，为什么 -->

## 关联 Issue

<!-- 如 Closes #123 -->

## 检查项

### 代码变更

- [ ] `pnpm tsc --noEmit && pnpm lint` 通过
- [ ] `pnpm test` 通过
- [ ] UI 覆盖 loading / error / empty / success 四态（如适用）
- [ ] 无硬编码密钥、无调试用 console.log、无死代码

### 内容变更

- [ ] 引用了官方来源
- [ ] 标注了依赖版本 / 模型版本
- [ ] 标注了 `lastVerifiedAt` 与内容状态
- [ ] 示例代码可编译、可运行，并记录了预期输出
- [ ] 说明了适用场景、不适用场景与已知限制
- [ ] 连接到相关图谱节点 / Lab（如适用）

详见 [内容可信度标准](../docs/content-standards.md)。
