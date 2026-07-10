import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { getCompareArticleFromBackend, CompareArticleDetailView } from '@/features/compare';

export const dynamic = 'force-dynamic';

export default async function CompareArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('compare');
  const locale = await getLocale();
  const article = await getCompareArticleFromBackend(id, locale).catch(() => null);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/compare"
            className="inline-flex items-center text-stellar-green hover:text-stellar-green/80 font-medium mb-4 transition-colors"
          >
            ← {t('back')}
          </Link>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmos-border bg-cosmos-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cosmos-dim">
            <span className="h-2 w-2 rounded-full bg-stellar-green" />
            {t('badge')}
          </div>
        </div>

        <CompareArticleDetailView article={article} locale={locale} />
      </div>
    </div>
  );
}
