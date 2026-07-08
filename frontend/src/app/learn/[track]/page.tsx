import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { DifficultyBadge } from '@/components/shared/DifficultyBadge';
import { STAGE_LABELS } from '@/lib/constants';
import { getTrackPageData } from '@/features/learn/server/learningService';

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track: slug } = await params;

  const pageData = getTrackPageData(getDb(), slug);
  if (!pageData) notFound();
  const { track, modules, allLessons, overallPercent } = pageData;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* ─── Track Header ──────────────────────────────── */}
      <div className="mb-12">
        <Link href="/" className="text-sm text-stellar-blue hover:text-stellar-violet mb-4 inline-block">
          ← 返回路线列表
        </Link>
        <div className="flex items-start gap-4 mt-4">
          <span className="text-4xl">{track.icon || '📚'}</span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-cosmos-text font-display mb-2">{track.title}</h1>
            <p className="text-cosmos-dim mb-4">{track.subtitle}</p>
            <div className="flex items-center gap-4 text-sm text-cosmos-dim">
              <DifficultyBadge difficulty={track.difficulty} size="md" />
              <span>⏱️ {track.estimatedHours} 小时</span>
              <span>📚 {allLessons.length} 课时</span>
              <span>📦 {modules.length} 模块</span>
            </div>
          </div>
          {/* Progress circle */}
          <div className="text-center shrink-0">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke="url(#gradient)" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - overallPercent / 100)}`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5b9cf5" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-cosmos-text font-display">{overallPercent}%</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-cosmos-dim mt-6 leading-relaxed bg-cosmos-surface/50 rounded-xl p-4 border border-cosmos-border">
          {track.description}
        </p>
      </div>

      {/* ─── Module Timeline ────────────────────────────── */}
      <div className="space-y-8">
        {modules.map((mod) => {
          const modLessons = allLessons.filter(l => l.lesson.moduleId === mod.id);
          const modCompleted = modLessons.filter(l => l.progress?.status === 'completed').length;
          const modPercent = modLessons.length > 0 ? Math.round((modCompleted / modLessons.length) * 100) : 0;
          const stageInfo = STAGE_LABELS[mod.stage] || { title: `Stage ${mod.stage}`, goal: '' };

          return (
            <div key={mod.id} className="glass-card p-6">
              {/* Module header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-stellar-blue bg-stellar-blue/10 px-2 py-0.5 rounded">
                      Stage {mod.stage} · {stageInfo.title}
                    </span>
                    <DifficultyBadge difficulty={mod.difficulty} />
                  </div>
                  <h3 className="text-lg font-bold text-cosmos-text">{mod.title}</h3>
                  <p className="text-sm text-cosmos-dim mt-1">{mod.description}</p>
                  <p className="text-xs text-stellar-violet/70 mt-1 italic">🎯 {stageInfo.goal}</p>
                </div>
                <div className="text-right text-xs text-cosmos-dim shrink-0">
                  <div>{modCompleted}/{modLessons.length} 完成</div>
                  <div className="w-24 mt-1"><ProgressBar percent={modPercent} /></div>
                </div>
              </div>

              {/* Lesson list */}
              <div className="space-y-1.5 mt-4">
                {modLessons.map(({ lesson, progress }, idx) => (
                  <Link
                    key={lesson.id}
                    href={`/learn/${slug}/${mod.id}/${lesson.slug}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      progress?.status === 'completed'
                        ? 'bg-emerald-400/5 border border-emerald-400/10 hover:bg-emerald-400/10'
                        : progress?.status === 'in_progress'
                          ? 'bg-stellar-blue/5 border border-stellar-blue/10 hover:bg-stellar-blue/10'
                          : 'bg-transparent border border-transparent hover:bg-white/[0.02] hover:border-cosmos-border'
                    }`}
                  >
                    {/* Status indicator */}
                    <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {progress?.status === 'completed' ? (
                        <span className="text-emerald-400">✓</span>
                      ) : progress?.status === 'in_progress' ? (
                        <span className="text-stellar-blue">⌛</span>
                      ) : (
                        <span className="text-cosmos-dim">{idx + 1}</span>
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium group-hover:text-stellar-blue transition-colors ${
                        progress?.status === 'completed' ? 'text-cosmos-dim' : 'text-cosmos-text'
                      }`}>
                        {lesson.title}
                      </span>
                      {lesson.experimentConfig && (
                        <span className="text-[10px] text-stellar-violet ml-2">🔬 含实验</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <DifficultyBadge difficulty={lesson.difficulty} />
                      <span className="text-cosmos-dim">{lesson.estimatedMinutes}min</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Outcome Section ────────────────────────────── */}
      <div className="mt-12 glass-card p-8">
        <h2 className="text-xl font-bold text-cosmos-text mb-4">🎓 学完你将能够</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {track.outcomeSkills.map((skill: string) => (
            <div key={skill} className="flex items-center gap-3">
              <span className="text-emerald-400 text-sm">✓</span>
              <span className="text-sm text-cosmos-dim">{skill}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-xl bg-stellar-violet/5 border border-stellar-violet/10">
          <span className="text-xs font-semibold text-stellar-violet">🏆 毕业项目</span>
          <p className="text-sm text-cosmos-dim mt-1">{track.outcomeProject}</p>
        </div>
      </div>
    </div>
  );
}
