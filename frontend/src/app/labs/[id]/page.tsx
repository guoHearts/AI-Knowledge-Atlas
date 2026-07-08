import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getLabById } from '@/features/labs/utils/labs';

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lab = getLabById(id);

  if (!lab) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/labs"
        className="mb-6 inline-flex text-sm font-medium text-stellar-green hover:text-stellar-green/80"
      >
        Back to Labs
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
            <dt className="text-cosmos-dim">Repository path</dt>
            <dd className="mt-1 font-mono text-cosmos-text">{lab.path}</dd>
          </div>
          <div>
            <dt className="text-cosmos-dim">Estimated cost</dt>
            <dd className="mt-1 text-cosmos-text">{lab.estimatedCost}</dd>
          </div>
          <div>
            <dt className="text-cosmos-dim">API key</dt>
            <dd className="mt-1 text-cosmos-text">
              {lab.requiresApiKey ? 'Required' : 'Not required'}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-cosmos-text">Local verification</h2>
          <div className="mt-3 rounded-lg border border-cosmos-border bg-cosmos-bg p-4">
            {lab.commands.map((command) => (
              <code key={command} className="block py-1 font-mono text-sm text-cosmos-text">
                {command}
              </code>
            ))}
          </div>
          <p className="mt-3 text-sm text-cosmos-dim">
            This page owns routing and rendering only. Lab metadata lives in the
            labs feature module and can later be replaced by backend API data.
          </p>
        </div>
      </section>
    </main>
  );
}
