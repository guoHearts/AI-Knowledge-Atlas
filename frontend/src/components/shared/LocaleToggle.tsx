'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { SupportedLocale } from '@/i18n/request';

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function LocaleToggle() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const t = useTranslations('locale');
  const nextLocale: SupportedLocale = locale === 'zh-CN' ? 'en-US' : 'zh-CN';

  function switchLocale() {
    document.cookie = `locale=${nextLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="flex items-center gap-1.5 rounded-full border border-cosmos-border bg-cosmos-bg/70 px-2.5 py-1.5 text-xs font-semibold text-cosmos-dim transition-colors hover:border-cosmos-text/30 hover:text-cosmos-text"
      aria-label={t('toggle')}
      title={t('toggle')}
    >
      <Languages className="h-3.5 w-3.5" />
      <span>{t('next')}</span>
    </button>
  );
}
