'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { GraphWorkspaceView } from '@/features/graph';

function GraphPageInner() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get('focus');

  return <GraphWorkspaceView focusId={focusId} />;
}

export default function GraphPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="正在加载知识图谱..." />}>
      <GraphPageInner />
    </Suspense>
  );
}
