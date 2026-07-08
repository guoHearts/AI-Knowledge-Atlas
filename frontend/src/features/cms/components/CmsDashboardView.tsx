import Link from 'next/link';

import type { CmsDashboardData } from '../api/cmsApi';

interface CmsDashboardViewProps {
  data: CmsDashboardData;
}

export function CmsDashboardView({ data }: CmsDashboardViewProps) {
  const { stats, tracks } = data;
  const statItems = [
    { label: 'Tracks', value: stats.trackCount, icon: 'R' },
    { label: 'Published lessons', value: stats.publishedLessonCount, icon: 'L' },
    { label: 'Draft lessons', value: stats.draftLessonCount, icon: 'D' },
    { label: 'Design patterns', value: stats.designPatternCount, icon: 'P' },
  ];

  const actions = [
    {
      href: '/cms/editor',
      title: 'Course editor',
      description: 'Edit MDX lessons, experiment metadata, and learning content.',
      accent: 'hover:border-stellar-blue/30',
    },
    {
      href: '/cms/generate',
      title: 'Generation workshop',
      description: 'Run the content generation pipeline from topic to lesson draft.',
      accent: 'hover:border-stellar-violet/30',
    },
    {
      href: '/cms/publish',
      title: 'Publish queue',
      description: 'Review draft changes and prepare approved content for release.',
      accent: 'hover:border-stellar-emerald/30',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-2 font-display text-3xl font-bold text-cosmos-text">Content management</h1>
      <p className="mb-10 text-sm text-cosmos-dim">Manage learning content, generation, and publishing workflows.</p>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4">
        {statItems.map((stat) => (
          <div key={stat.label} className="glass-card flex items-center gap-4 p-4">
            <span className="grid h-9 w-9 place-items-center rounded border border-cosmos-border font-mono text-sm text-cosmos-text">
              {stat.icon}
            </span>
            <div>
              <div className="text-2xl font-bold text-cosmos-text">{stat.value}</div>
              <div className="text-xs text-cosmos-dim">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className={`glass-card p-6 transition-all ${action.accent}`}>
            <h3 className="mb-2 text-lg font-bold text-cosmos-text">{action.title}</h3>
            <p className="text-xs leading-5 text-cosmos-dim">{action.description}</p>
          </Link>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-bold text-cosmos-text">Track overview</h2>
        <div className="space-y-3">
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-xl">{track.icon || 'T'}</span>
                <div>
                  <span className="text-sm font-medium text-cosmos-text">{track.title}</span>
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                    track.status === 'published'
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : 'bg-amber-400/10 text-amber-400'
                  }`}>
                    {track.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-cosmos-dim">
                <span>{track.moduleCount} modules</span>
                <span>{track.lessonCount} lessons</span>
                <Link href={`/cms/editor/${track.slug}`} className="text-stellar-blue hover:text-stellar-violet">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
