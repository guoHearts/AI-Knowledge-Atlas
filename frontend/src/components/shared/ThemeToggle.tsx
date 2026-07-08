'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const t = useTranslations('theme');

  if (!mounted) {
    return (
      <button
        className="flex items-center gap-1.5 rounded-full border border-cosmos-border bg-cosmos-bg/70 px-3 py-1.5 text-xs font-medium text-cosmos-dim"
        aria-label={t('toggle')}
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-1.5 rounded-full border border-cosmos-border bg-cosmos-bg/70 px-2.5 py-1.5 text-xs font-medium text-cosmos-dim transition-colors hover:text-cosmos-text hover:border-cosmos-text/30"
      aria-label={isDark ? t('toLight') : t('toDark')}
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5" />
      ) : (
        <Moon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
