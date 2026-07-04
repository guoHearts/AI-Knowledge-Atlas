import Link from 'next/link';
import { getDb } from '@/lib/db';
import type { LearningTrackRow } from '@/types/learning';
import { toTrack, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types/learning';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { AnimatedSection, StaggerList, StaggerItem, HoverCard } from '@/components/shared/AnimatedSection';

export default function HomePage() {
  const db = getDb();
  const trackRows = db.prepare(`
    SELECT * FROM learning_tracks WHERE status = 'published' ORDER BY sort_order
  `).all() as LearningTrackRow[];
  const tracks = trackRows.map(toTrack);

  const stats = db.prepare(`
    SELECT
      COUNT(DISTINCT l.id) as totalLessons,
      COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN l.id END) as completedLessons
    FROM lessons l
    LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = 'default'
    WHERE l.status = 'published'
  `).get() as { totalLessons: number; completedLessons: number };

  const totalCompletionRate = stats.totalLessons > 0
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* ─── Hero ──────────────────────────────────────── */}
      <AnimatedSection className="text-center mb-16">
        <h1 className="text-5xl font-bold text-cosmos-text font-display mb-4 tracking-tight">
          <span className="text-gradient">AI 开发者实训平台</span>
        </h1>
        <p className="text-lg text-cosmos-dim max-w-2xl mx-auto leading-relaxed">
          用知识图谱看清 AI 技术全貌，用结构化学习路径真正上手开发。
          <br />
          学完能在企业里交付 AI 项目。
        </p>

        {/* Progress overview */}
        <div className="mt-8 inline-flex items-center gap-6 glass-card px-6 py-3 animate-glow">
          <div className="text-center">
            <div className="text-3xl font-bold text-stellar-blue font-display">{totalCompletionRate}%</div>
            <div className="text-[11px] text-cosmos-dim">总体完成度</div>
          </div>
          <div className="w-px h-10 bg-cosmos-border" />
          <div className="text-center">
            <div className="text-3xl font-bold text-cosmos-text font-display">{stats.completedLessons}/{stats.totalLessons}</div>
            <div className="text-[11px] text-cosmos-dim">课时完成</div>
          </div>
          <div className="w-px h-10 bg-cosmos-border" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-cosmos-dim">学习中</span>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── Track Cards ────────────────────────────────── */}
      <AnimatedSection delay={0.1}>
        <h2 className="text-2xl font-bold text-cosmos-text font-display mb-6">实训路线</h2>
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => {
            const trackProgress = db.prepare(`
              SELECT COUNT(*) as completed FROM user_progress up
              JOIN lessons l ON up.lesson_id = l.id
              JOIN modules m ON l.module_id = m.id
              WHERE m.track_id = ? AND up.user_id = 'default' AND up.status = 'completed'
            `).get(track.id) as { completed: number };

            const totalLessons = db.prepare(`
              SELECT COUNT(*) as total FROM lessons l
              JOIN modules m ON l.module_id = m.id
              WHERE m.track_id = ? AND l.status = 'published'
            `).get(track.id) as { total: number };

            const progress = totalLessons.total > 0
              ? Math.round((trackProgress.completed / totalLessons.total) * 100)
              : 0;

            return (
              <StaggerItem key={track.id}>
                <Link href={`/learn/${track.slug}`} className="block">
                  <HoverCard className="glass-card p-6 group hover:border-stellar-blue/30">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl">{track.icon || '📚'}</span>
                      <span className={`difficulty-badge ${DIFFICULTY_COLORS[track.difficulty] || 'text-cosmos-dim bg-cosmos-bg border-cosmos-border'}`}>
                        {DIFFICULTY_LABELS[track.difficulty] || track.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-cosmos-text mb-2 group-hover:text-stellar-blue transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-sm text-cosmos-dim mb-4 leading-relaxed">
                      {track.subtitle}
                    </p>

                    {track.outcomeSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {track.outcomeSkills.slice(0, 4).map((skill: string) => (
                          <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-stellar-blue/5 text-stellar-blue border border-stellar-blue/10">
                            {skill}
                          </span>
                        ))}
                        {track.outcomeSkills.length > 4 && (
                          <span className="text-[10px] text-cosmos-dim">+{track.outcomeSkills.length - 4}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-cosmos-dim">
                        {track.estimatedHours} 小时 · {totalLessons.total} 课时
                      </span>
                      <span className="text-xs text-stellar-blue font-semibold">{progress}%</span>
                    </div>
                    <ProgressBar percent={progress} />
                  </HoverCard>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerList>
      </AnimatedSection>

      {/* ─── Quick Start ────────────────────────────────── */}
      <AnimatedSection delay={0.2} className="mt-16">
        <h2 className="text-2xl font-bold text-cosmos-text font-display mb-6">快速开始</h2>
        <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: 1, title: '选择路线', desc: '根据你的背景和目标，选择最适合的学习路线', icon: '🗺️' },
            { step: 2, title: '跟着课时走', desc: '每个课时包含讲解、实验和自检，确保学到实处', icon: '👨‍💻' },
            { step: 3, title: '拿到结果', desc: '完成毕业项目，积累可放入简历的真实作品', icon: '🏆' },
          ].map((item) => (
            <StaggerItem key={item.step}>
              <HoverCard className="glass-card p-5 text-center">
                <span className="text-3xl block mb-3">{item.icon}</span>
                <div className="text-[10px] text-stellar-blue font-semibold mb-1">Step {item.step}</div>
                <h3 className="text-sm font-semibold text-cosmos-text mb-1">{item.title}</h3>
                <p className="text-xs text-cosmos-dim">{item.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerList>
      </AnimatedSection>
    </div>
  );
}
