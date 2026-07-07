import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { AnimatedSection, StaggerItem, StaggerList } from '@/components/shared/AnimatedSection';

const ROADMAP = [
  {
    layer: '01',
    title: 'Agent 基础层',
    eyebrow: 'Concepts',
    description: '先看懂 Agent、工具调用、MCP、设计模式和多 Agent 协作。',
    modules: '模块 1-5',
    accent: 'bg-stellar-blue',
  },
  {
    layer: '02',
    title: '生产工程层',
    eyebrow: 'Production',
    description: '补齐可观测性、错误处理、安全防护、RAG、微调和推理优化。',
    modules: '模块 6-10',
    accent: 'bg-stellar-emerald',
  },
  {
    layer: '03',
    title: '平台治理层',
    eyebrow: 'Platform',
    description: '用 Agents SDK、LangGraph、MCP 治理、评测流水线把 Demo 变成系统。',
    modules: '模块 11',
    accent: 'bg-stellar-violet',
  },
  {
    layer: '04',
    title: '产品形态层',
    eyebrow: 'Product',
    description: '进入实时语音、多模态文档、编程 Agent、合成数据与蒸馏。',
    modules: '模块 12',
    accent: 'bg-stellar-rose',
  },
];

const NEXT_STEPS = [
  '把图谱检索升级为 GraphRAG：实体、关系、社区摘要、Local / Global 查询。',
  '加入向量索引与混合检索：全文搜索、embedding、rerank 组成完整检索链。',
  '为 Agent 增加运行态：session、checkpoint、人工审批、任务恢复。',
  '建立评测闭环：测试集、打分器、回归门禁、trace 观测。',
  '增加可信度字段：来源、发布时间、置信度、最后验证时间。',
];

export default function HomePage() {
  const db = getDb();

  const stats = db.prepare(`
    SELECT
      COUNT(DISTINCT m.id) as totalModules,
      COUNT(DISTINCT l.id) as totalLessons,
      COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN l.id END) as completedLessons
    FROM modules m
    LEFT JOIN lessons l ON l.module_id = m.id AND l.status = 'published'
    LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = 'default'
    WHERE m.status = 'published'
  `).get() as { totalModules: number; totalLessons: number; completedLessons: number };

  const patternStats = db.prepare(`
    SELECT COUNT(*) as totalPatterns FROM design_patterns
  `).get() as { totalPatterns: number };

  const completionRate = stats.totalLessons > 0
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
    : 0;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-cosmos-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <AnimatedSection>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cosmos-border bg-cosmos-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cosmos-dim">
              <span className="h-2 w-2 rounded-full bg-stellar-blue" />
              AI Engineering Radar
            </div>
            <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.98] tracking-tight text-cosmos-text lg:text-7xl">
              读懂快速变化的 AI 工程生态。
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-cosmos-dim">
              持续更新、来源可追溯、代码可运行的 AI 工程技术雷达。
              发现值得关注的新模型、新框架与新工程实践，理解它们为什么重要，
              并通过知识图谱看清 Agent、RAG、MCP、LLMOps 之间的关系。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/graph" className="btn-primary">
                探索知识图谱
              </Link>
              <Link href="/learn/agent-engineer" className="btn-ghost">
                开始学习路线
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.12} className="grid content-end gap-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '模块', value: stats.totalModules },
                { label: '课时', value: stats.totalLessons },
                { label: '模式', value: patternStats.totalPatterns },
              ].map((item) => (
                <div key={item.label} className="border border-cosmos-border bg-cosmos-surface p-5 shadow-sm">
                  <div className="font-display text-4xl font-bold text-cosmos-text">{item.value}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cosmos-dim">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="border border-cosmos-text bg-cosmos-surface p-5 shadow-[8px_8px_0_rgba(23,32,28,0.1)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-cosmos-dim">当前完成度</div>
                  <div className="mt-1 font-display text-5xl font-bold text-cosmos-text">{completionRate}%</div>
                </div>
                <div className="max-w-[190px] text-right text-xs leading-5 text-cosmos-dim">
                  用完成度记录学习进展，用图谱记录概念之间的理解路径。
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar percent={completionRate} size="md" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <AnimatedSection>
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stellar-blue">Roadmap</p>
              <h2 className="mt-2 font-display text-4xl font-bold text-cosmos-text">四层学习地图</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-cosmos-dim">
              每一层回答一个问题：它是什么、怎么做、怎么上线、怎么变成产品。
            </p>
          </div>
        </AnimatedSection>

        <StaggerList className="relative grid gap-4 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px lg:block map-line" />
          {ROADMAP.map((item) => (
            <StaggerItem key={item.layer}>
              <article className="relative min-h-[250px] border border-cosmos-border bg-cosmos-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-cosmos-text/30 hover:shadow-xl">
                <div className={`mb-6 h-3 w-16 ${item.accent}`} />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cosmos-dim">{item.eyebrow}</span>
                  <span className="font-display text-3xl font-bold text-cosmos-text">{item.layer}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-cosmos-text">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-cosmos-dim">{item.description}</p>
                <div className="absolute bottom-5 left-5 rounded-full border border-cosmos-border bg-cosmos-bg px-3 py-1 text-xs font-semibold text-cosmos-text">
                  {item.modules}
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <AnimatedSection>
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stellar-rose">Next Build</p>
              <h2 className="mt-2 font-display text-4xl font-bold text-cosmos-text">下一步该补什么</h2>
            </div>
            <Link href="/graph" className="btn-ghost w-fit">
              去图谱里验证
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid gap-3">
          {NEXT_STEPS.map((item, index) => (
            <div key={item} className="grid grid-cols-[56px_1fr] border border-cosmos-border bg-cosmos-surface">
              <div className="grid place-items-center border-r border-cosmos-border font-display text-2xl font-bold text-cosmos-text">
                {index + 1}
              </div>
              <p className="px-5 py-4 text-sm leading-6 text-cosmos-dim">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
