import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getLabById } from '@/features/labs/api/labsApi';

export const dynamic = 'force-dynamic';

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('labs');
  const { id } = await params;
  const lab = await getLabById(id);

  if (!lab) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/labs"
        className="mb-6 inline-flex text-sm font-medium text-stellar-green hover:text-stellar-green/80"
      >
        {t('back')}
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

        <dl className="mt-8 grid gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-cosmos-dim">{t('repositoryPath')}</dt>
            <dd className="mt-1 font-mono text-cosmos-text">{lab.path}</dd>
          </div>
          <div>
            <dt className="text-cosmos-dim">{t('estimatedCost')}</dt>
            <dd className="mt-1 text-cosmos-text">{lab.estimatedCost}</dd>
          </div>
          <div>
            <dt className="text-cosmos-dim">{t('apiKey')}</dt>
            <dd className="mt-1 text-cosmos-text">
              {lab.requiresApiKey ? t('apiKeyRequired') : t('apiKeyNotRequired')}
            </dd>
          </div>
          {lab.lastVerifiedAt && (
            <div>
              <dt className="text-cosmos-dim">Last verified</dt>
              <dd className="mt-1 text-cosmos-text">{lab.lastVerifiedAt}</dd>
            </div>
          )}
        </dl>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-cosmos-text">{t('localVerification')}</h2>
          <div className="mt-3 rounded-lg border border-cosmos-border bg-cosmos-bg p-4">
            {lab.commands.map((command) => (
              <code key={command} className="block py-1 font-mono text-sm text-cosmos-text">
                {command}
              </code>
            ))}
          </div>
          <p className="mt-3 text-sm text-cosmos-dim">
            {t('metadataNote')}
          </p>
        </div>

        {lab.expectedOutputs?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Expected outputs</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cosmos-dim">
              {lab.expectedOutputs.map((output) => (
                <li key={output}>- {output}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {lab.packages?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Pinned packages</h2>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              {lab.packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className="rounded border border-cosmos-border px-3 py-2 font-mono text-cosmos-text"
                >
                  {pkg.name}@{pkg.version}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {lab.sources?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Official sources</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {lab.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} className="text-stellar-green hover:text-stellar-green/80">
                    {source.title}
                  </a>
                  <span className="ml-2 text-cosmos-dim">({source.type})</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {lab.failureModes?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Common failure modes</h2>
            <div className="mt-3 space-y-3">
              {lab.failureModes.map((mode) => (
                <div key={mode.title} className="rounded border border-cosmos-border p-3">
                  <p className="font-medium text-cosmos-text">{mode.title}</p>
                  <p className="mt-1 text-sm leading-6 text-cosmos-dim">{mode.resolution}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {lab.securityNotes?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Security notes</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cosmos-dim">
              {lab.securityNotes.map((note) => (
                <li key={note}>- {note}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {lab.knownLimitations?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Known limitations</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cosmos-dim">
              {lab.knownLimitations.map((limitation) => (
                <li key={limitation}>- {limitation}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {lab.relatedRadarItemIds?.length ||
        lab.relatedCompareIds?.length ||
        lab.relatedNodeIds?.length ||
        lab.relatedLearningPaths?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Related paths</h2>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
              {lab.relatedRadarItemIds?.map((radarId) => (
                <Link
                  key={radarId}
                  href={`/radar/${radarId}`}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  Radar: {radarId}
                </Link>
              ))}
              {lab.relatedCompareIds?.map((compareId) => (
                <Link
                  key={compareId}
                  href={`/compare/${compareId}`}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  Compare: {compareId}
                </Link>
              ))}
              {lab.relatedNodeIds?.map((nodeId) => (
                <Link
                  key={nodeId}
                  href={`/graph?node=${encodeURIComponent(nodeId)}`}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  Graph: {nodeId}
                </Link>
              ))}
              {lab.relatedLearningPaths?.map((path) => (
                <Link
                  key={path.href}
                  href={path.href}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  Learn: {path.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
