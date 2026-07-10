import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  const common = await getTranslations('common');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="rounded-full border border-cosmos-border bg-cosmos-surface px-4 py-1.5">
        <span className="font-mono text-xs font-bold text-cosmos-dim">
          404
        </span>
      </div>
      <h2 className="font-display text-2xl font-bold text-cosmos-text">
        {t('title')}
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-cosmos-dim">
        {t('description')}
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">
          {common('backHome')}
        </Link>
        <Link href="/graph" className="btn-ghost">
          {common('exploreGraph')}
        </Link>
      </div>
    </div>
  );
}
