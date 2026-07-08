# 路线图

> 本路线图对应改造方案的 90 天计划（见 `docs/AI-Knowledge-Atlas-改造方案.md` §22）。
> 原则：**先建立可信度，再形成可持续发布的核心产品**，不追求一次性大而全。

## 执行顺序

按方案 §29，改造严格按以下顺序推进，不同时改所有模块：

1. 修复错误内容
2. 重写项目定位
3. 重写 README
4. 增加内容状态与验证日期
5. 完成一个高质量 Lab
6. 上线第一期 Radar
7. 改造首页
8. 完善知识图谱
9. 重构学习路线
10. 社区与推广

## 第 1 月：完成定位重构

- [x] 开源治理文件（LICENSE / CONTRIBUTING / CODE_OF_CONDUCT / SECURITY / CHANGELOG / ROADMAP）
- [x] `.github` Issue / PR 模板
- [x] 内容可信度标准文档
- [x] 重写 README 与项目定位
- [x] 首页移除无法解释的能力评分
- [x] 首页 / 学习元数据 / Labs 静态数组迁移到后端 learning catalog
- [x] 默认中文 i18n 与导航栏语言切换
- [x] Graph / Learn 组件与类型文件归位到 feature 目录
- [ ] 内容状态字段落地到数据层（radar_items / sources / content_verifications）
- [ ] 第一个 Verified Lab（Secure MCP Server）
- [ ] 第一期 AI Engineering Radar
- [ ] 新首页（Radar / Labs / 选型入口）

## 第 2 月：形成持续更新能力

- [ ] 每周 Radar 发布节奏
- [ ] 每两周一个新 Lab（Production Agent、Hybrid RAG Evaluation）
- [ ] 技术选型（Compare）栏目
- [ ] 内容过期检测（90 天未验证 → Needs Review；CI 失败 → 移除 Verified）
- [ ] 知识图谱决策化：替代方案、相关实验、按成熟度筛选
- [ ] 第一批 Good First Issue 与外部贡献者

## 第 3 月：形成社区与品牌

- [ ] 多语言支持（README.zh-CN / 内容双语）
- [ ] Newsletter / 社区群
- [ ] 外部作者贡献机制
- [ ] 技术专题与趋势榜单
- [ ] 公开内容 API
- [ ] 项目 Showcase

## 关键指标

不以 Star 为唯一目标，同时跟踪：Lab Runs、Radar → Lab 转化、内容验证率（Content Verification Rate）、过期内容比例（Stale Content Ratio）、外部贡献者数量。

## 页面开发优先级

- **P0**：README、首页第一屏、Radar 列表/详情、Labs 列表/详情、内容状态、最后验证日期、官方来源、社区文件
- **P1**：技术对比页、图谱筛选、学习路线重构、收藏、搜索、内容过期提醒、CI 状态
- **P2**：用户账号、学习进度、Newsletter、评论、推荐、个性化、多语言、公共 API
