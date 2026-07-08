'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { GraphWorkspaceView } from '@/features/graph';

function GraphPageInner() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get('focus');

  return <GraphWorkspaceView focusId={focusId} />;
}

export default function GraphPage() {
  const t = useTranslations('graph');

  return (
    <Suspense fallback={<LoadingSpinner text={t('loadingGraph')} />}>
      <GraphPageInner />
    </Suspense>
  );
}
