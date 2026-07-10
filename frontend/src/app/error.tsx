'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="rounded-full border border-cosmos-border bg-cosmos-surface px-4 py-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cosmos-dim">
          {t('badge')}
        </span>
      </div>
      <h2 className="max-w-md font-display text-2xl font-bold text-cosmos-text">
        {t('title')}
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-cosmos-dim">
        {t('description')}
      </p>
      <button
        onClick={reset}
        className="btn-primary"
      >
        {t('retry')}
      </button>
    </div>
  );
}
