import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { CompareListView } from '@/features/compare';

export const dynamic = 'force-dynamic';

export default async function ComparePage() {
  const t = await getTranslations('compare');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmos-border bg-cosmos-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cosmos-dim">
            <span className="h-2 w-2 rounded-full bg-stellar-green" />
            {t('badge')}
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-cosmos-text lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-cosmos-dim">{t('description')}</p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="bg-cosmos-surface rounded-lg p-6 border border-cosmos-border animate-pulse">
                <div className="h-6 bg-cosmos-border rounded w-3/4 mb-4" />
                <div className="h-4 bg-cosmos-border rounded w-1/2" />
              </div>
            </div>
          }
        >
          <CompareListView />
        </Suspense>

        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <Link
            href="/radar"
            className="inline-block bg-stellar-green hover:bg-stellar-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {t('viewRadar')}
          </Link>
          <Link
            href="/labs"
            className="inline-block border border-cosmos-border hover:bg-cosmos-surface text-cosmos-text px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {t('browseLabs')}
          </Link>
        </div>
      </div>
    </div>
  );
}
