import Link from 'next/link'
import { notFound } from 'next/navigation'

const LABS = [
  {
    id: 'secure-mcp-server',
    title: 'Secure MCP Server',
    status: 'Draft',
    difficulty: 'Intermediate',
    estimatedSetupTime: '15min',
    estimatedCost: '< $1',
    requiresApiKey: true,
    path: 'labs/secure-mcp-server',
    commands: [
      'cd labs/secure-mcp-server',
      'python -m venv .venv',
      'pip install -r requirements.txt',
      'python -m pytest tests -q',
      'python main.py',
    ],
    summary:
      '带 tool allowlist、参数校验、审计日志和基础输入防护的 MCP Server 标杆实验。',
  },
  {
    id: 'production-agent-with-human-approval',
    title: 'Production Agent with Human Approval',
    status: 'Draft',
    difficulty: 'Intermediate',
    estimatedSetupTime: '20min',
    estimatedCost: '< $1',
    requiresApiKey: true,
    path: 'labs/production-agent-with-human-approval',
    commands: [
      'cd labs/production-agent-with-human-approval',
      'python -m venv .venv',
      'pip install -r requirements.txt',
      'python -m pytest tests -q',
      'python src/main.py',
    ],
    summary:
      '展示 human approval、任务状态流转和生产化边界的 Agent 实验。',
  },
]

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lab = LABS.find((item) => item.id === id)

  if (!lab) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/labs"
        className="mb-6 inline-flex text-sm font-medium text-stellar-green hover:text-stellar-green/80"
      >
        返回 Labs
      </Link>

      <section className="rounded-lg border border-cosmos-border bg-cosmos-surface p-8">
        <div className="mb-5 flex flex-wrap items-center gap-2">
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

        <h1 className="font-display text-3xl font-bold text-cosmos-text">
          {lab.title}
        </h1>
        <p className="mt-4 leading-7 text-cosmos-dim">{lab.summary}</p>

        <dl className="mt-8 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="text-cosmos-dim">仓库路径</dt>
            <dd className="mt-1 font-mono text-cosmos-text">{lab.path}</dd>
          </div>
          <div>
            <dt className="text-cosmos-dim">预估成本</dt>
            <dd className="mt-1 text-cosmos-text">{lab.estimatedCost}</dd>
          </div>
          <div>
            <dt className="text-cosmos-dim">API Key</dt>
            <dd className="mt-1 text-cosmos-text">
              {lab.requiresApiKey ? '需要' : '不需要'}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-cosmos-text">本地验证命令</h2>
          <div className="mt-3 rounded-lg border border-cosmos-border bg-cosmos-bg p-4">
            {lab.commands.map((command) => (
              <code key={command} className="block py-1 font-mono text-sm text-cosmos-text">
                {command}
              </code>
            ))}
          </div>
          <p className="mt-3 text-sm text-cosmos-dim">
            当前页面只承接入口和运行说明。CI、截图、最后验证记录补齐后再升级为 Verified。
          </p>
        </div>
      </section>
    </main>
  )
}
