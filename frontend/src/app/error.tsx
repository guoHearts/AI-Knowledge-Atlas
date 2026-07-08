'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="rounded-full border border-cosmos-border bg-cosmos-surface px-4 py-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cosmos-dim">
          页面出错
        </span>
      </div>
      <h2 className="max-w-md font-display text-2xl font-bold text-cosmos-text">
        页面加载异常
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-cosmos-dim">
        请稍后重试。如问题持续出现，请联系维护者。
      </p>
      <button
        onClick={reset}
        className="btn-primary"
      >
        重试
      </button>
    </div>
  );
}
