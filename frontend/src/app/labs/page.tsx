import Link from 'next/link'

const LABS = [
  {
    id: 'secure-mcp-server',
    title: 'Secure MCP Server',
    status: 'Draft',
    difficulty: 'Intermediate',
    estimatedSetupTime: '15min',
    summary:
      '带 tool allowlist、参数校验、审计日志和基础输入防护的 MCP Server 标杆实验。',
    path: 'labs/secure-mcp-server',
  },
  {
    id: 'production-agent-with-human-approval',
    title: 'Production Agent with Human Approval',
    status: 'Draft',
    difficulty: 'Intermediate',
    estimatedSetupTime: '20min',
    summary:
      '展示 human approval、任务状态流转和生产化边界的 Agent 实验。',
    path: 'labs/production-agent-with-human-approval',
  },
]

export default function LabsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmos-border bg-cosmos-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cosmos-dim">
          Verified Labs
        </div>
        <h1 className="font-display text-4xl font-bold text-cosmos-text">
          可运行实验
        </h1>
        <p className="mt-4 max-w-3xl text-cosmos-dim">
          Labs 用来验证技术雷达中的关键结论。当前实验先以 Draft 状态展示，等依赖、
          CI 和运行截图补齐后再标记为 Verified。
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {LABS.map((lab) => (
          <Link
            key={lab.id}
            href={`/labs/${lab.id}`}
            className="block rounded-lg border border-cosmos-border bg-cosmos-surface p-6 transition-colors hover:border-cosmos-text"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-700">
                {lab.status}
              </span>
              <span className="rounded border border-cosmos-border px-2 py-1 text-xs text-cosmos-dim">
                {lab.difficulty}
              </span>
              <span className="rounded border border-cosmos-border px-2 py-1 text-xs text-cosmos-dim">
                {lab.estimatedSetupTime}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-cosmos-text">{lab.title}</h2>
            <p className="mt-3 text-sm leading-6 text-cosmos-dim">{lab.summary}</p>
            <p className="mt-4 font-mono text-xs text-cosmos-dim">{lab.path}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
