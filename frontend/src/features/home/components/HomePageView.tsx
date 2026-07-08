import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { AnimatedSection, StaggerItem, StaggerList } from '@/components/shared/AnimatedSection';
import { ProgressBar } from '@/components/shared/ProgressBar';
import type { RadarItem } from '@/features/radar/types/radar.types';
import type { HomeContent, HomeStats } from '../api/homeApi';

interface HomePageViewProps {
  stats: HomeStats;
  content: HomeContent;
  radarItems: RadarItem[];
}

export async function HomePageView({ stats, content, radarItems }: HomePageViewProps) {
  const t = await getTranslations('home');
  const statItems = [
    { label: t('stats.modules'), value: stats.totalModules },
    { label: t('stats.lessons'), value: stats.totalLessons },
    { label: t('stats.patterns'), value: stats.totalPatterns },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-cosmos-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <AnimatedSection>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cosmos-border bg-cosmos-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cosmos-dim">
              <span className="h-2 w-2 rounded-full bg-stellar-blue" />
              {t('hero.eyebrow')}
            </div>
            <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.98] tracking-tight text-cosmos-text lg:text-7xl">
              AI Knowledge Atlas
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-cosmos-dim">
              {t('hero.description')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/graph" className="btn-primary">
                {t('hero.exploreGraph')}
              </Link>
              <Link href="/radar" className="btn-ghost">
                {t('hero.viewRadar')}
              </Link>
              <Link href="/learn/agent-engineer" className="btn-ghost">
                {t('hero.startLearning')}
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.12} className="grid content-end gap-4">
            <div className="grid grid-cols-3 gap-3">
              {statItems.map((item) => (
                <div key={item.label} className="border border-cosmos-border bg-cosmos-surface p-5 shadow-sm">
                  <div className="font-display text-4xl font-bold text-cosmos-text">{item.value}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cosmos-dim">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="border border-cosmos-text bg-cosmos-surface p-5 shadow-[8px_8px_0_rgba(23,32,28,0.1)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-cosmos-dim">{t('stats.completion')}</div>
                  <div className="mt-1 font-display text-5xl font-bold text-cosmos-text">{stats.completionRate}%</div>
                </div>
                <div className="max-w-[190px] text-right text-xs leading-5 text-cosmos-dim">
                  {t('stats.description')}
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar percent={stats.completionRate} size="md" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <AnimatedSection>
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stellar-emerald">{t('radar.eyebrow')}</p>
              <h2 className="mt-2 font-display text-4xl font-bold text-cosmos-text">{t('radar.title')}</h2>
            </div>
            <Link href="/radar" className="btn-ghost w-fit">
              {t('radar.viewAll')}
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid gap-4 lg:grid-cols-3">
          {radarItems.map((item) => (
            <Link
              key={item.id}
              href={`/radar/${item.id}`}
              className="group flex min-h-[260px] flex-col border border-cosmos-border bg-cosmos-surface p-5 transition-all hover:-translate-y-1 hover:border-cosmos-text/30 hover:shadow-xl"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded border border-cosmos-border bg-cosmos-bg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cosmos-dim">
                  {item.category}
                </span>
                <span className="rounded border border-stellar-green/30 bg-stellar-green/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stellar-green">
                  {item.status}
                </span>
              </div>
              <h3 className="text-lg font-bold leading-snug text-cosmos-text group-hover:text-stellar-blue">
                {item.title}
              </h3>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-cosmos-dim">
                {item.summary}
              </p>
              <div className="mt-auto pt-5 text-xs text-cosmos-dim">
                {t('radar.verifiedAt')} {new Date(item.last_verified_at).toLocaleDateString('zh-CN')}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <AnimatedSection>
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stellar-blue">{t('roadmap.eyebrow')}</p>
              <h2 className="mt-2 font-display text-4xl font-bold text-cosmos-text">{t('roadmap.title')}</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-cosmos-dim">
              {t('roadmap.description')}
            </p>
          </div>
        </AnimatedSection>

        <StaggerList className="relative grid gap-4 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px lg:block map-line" />
          {content.roadmap.map((item) => (
            <StaggerItem key={item.layer}>
              <article className="relative min-h-[250px] border border-cosmos-border bg-cosmos-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-cosmos-text/30 hover:shadow-xl">
                <div className={`mb-6 h-3 w-16 ${item.accent}`} />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cosmos-dim">{item.eyebrow}</span>
                  <span className="font-display text-3xl font-bold text-cosmos-text">{item.layer}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-cosmos-text">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-cosmos-dim">{item.description}</p>
                <div className="absolute bottom-5 left-5 rounded-full border border-cosmos-border bg-cosmos-bg px-3 py-1 text-xs font-semibold text-cosmos-text">
                  {item.modules}
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <AnimatedSection>
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stellar-rose">{t('nextWork.eyebrow')}</p>
              <h2 className="mt-2 font-display text-4xl font-bold text-cosmos-text">{t('nextWork.title')}</h2>
            </div>
            <Link href="/graph" className="btn-ghost w-fit">
              {t('nextWork.validate')}
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid gap-3">
          {content.nextSteps.map((item, index) => (
            <div key={item} className="grid grid-cols-[56px_1fr] border border-cosmos-border bg-cosmos-surface">
              <div className="grid place-items-center border-r border-cosmos-border font-display text-2xl font-bold text-cosmos-text">
                {index + 1}
              </div>
              <p className="px-5 py-4 text-sm leading-6 text-cosmos-dim">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
