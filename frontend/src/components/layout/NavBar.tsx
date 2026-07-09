'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LocaleToggle } from '@/components/shared/LocaleToggle';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const NAV_LINKS: { href: string; labelKey: 'route' | 'radar' | 'compare' | 'graph' | 'content' }[] = [
  { href: '/', labelKey: 'route' },
  { href: '/radar', labelKey: 'radar' },
  { href: '/compare', labelKey: 'compare' },
  { href: '/graph', labelKey: 'graph' },
  { href: '/cms', labelKey: 'content' },
];

export function NavBar() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <header className="sticky top-0 z-50 border-b border-cosmos-border bg-cosmos-surface/92 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-cosmos-text bg-cosmos-text text-cosmos-surface shadow-[4px_4px_0_rgba(35,88,216,0.22)] transition-transform group-hover:-translate-y-0.5">
            <span className="text-xs font-black tracking-tight">KA</span>
          </div>
          <div>
            <h1 className="font-display text-base font-bold leading-tight text-cosmos-text">
              Knowledge Atlas
            </h1>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-cosmos-dim">
              AI ENGINEERING
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1 rounded-lg border border-cosmos-border bg-cosmos-bg/70 p-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-cosmos-surface text-cosmos-text shadow-sm'
                    : 'text-cosmos-dim hover:text-cosmos-text'
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        <LocaleToggle />
        <ThemeToggle />
      </nav>
    </header>
  );
}
