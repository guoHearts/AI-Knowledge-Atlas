import Link from 'next/link';
import { getCmsDashboardData } from '@/features/cms/server/cmsService';

export const dynamic = 'force-dynamic';

export default async function CMSPage() {
  const { stats, tracks } = await getCmsDashboardData();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-cosmos-text font-display mb-2">内容管理后台</h1>
      <p className="text-sm text-cosmos-dim mb-10">管理课程内容、生成新课时、发布审核</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: '实训路线', value: stats.trackCount, icon: '🗺️' },
          { label: '已发布课时', value: stats.publishedLessonCount, icon: '📝' },
          { label: '草稿', value: stats.draftLessonCount, icon: '📄' },
          { label: '设计模式', value: stats.designPatternCount, icon: '🧩' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-4">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <div className="text-2xl font-bold text-cosmos-text">{stat.value}</div>
              <div className="text-xs text-cosmos-dim">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link href="/cms/editor" className="glass-card p-6 group hover:border-stellar-blue/30 transition-all">
          <span className="text-3xl block mb-3">✏️</span>
          <h3 className="text-lg font-bold text-cosmos-text mb-2 group-hover:text-stellar-blue">课程编辑器</h3>
          <p className="text-xs text-cosmos-dim">编辑 MDX 课程内容、配置实验任务、管理课时元数据</p>
        </Link>
        <Link href="/cms/generate" className="glass-card p-6 group hover:border-stellar-violet/30 transition-all">
          <span className="text-3xl block mb-3">🤖</span>
          <h3 className="text-lg font-bold text-cosmos-text mb-2 group-hover:text-stellar-violet">生成工坊</h3>
          <p className="text-xs text-cosmos-dim">AI 驱动的课程内容生成管线，从大纲到课时一键生成</p>
        </Link>
        <Link href="/cms/publish" className="glass-card p-6 group hover:border-stellar-emerald/30 transition-all">
          <span className="text-3xl block mb-3">🚀</span>
          <h3 className="text-lg font-bold text-cosmos-text mb-2 group-hover:text-stellar-emerald">发布管理</h3>
          <p className="text-xs text-cosmos-dim">审核待发布内容、对比变更、一键发布到生产</p>
        </Link>
      </div>

      {/* Tracks overview */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-cosmos-text mb-4">路线概览</h2>
        <div className="space-y-3">
          {tracks.map(track => (
              <div key={track.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{track.icon || '📚'}</span>
                  <div>
                    <span className="text-sm font-medium text-cosmos-text">{track.title}</span>
                    <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${
                      track.status === 'published'
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'bg-amber-400/10 text-amber-400'
                    }`}>
                      {track.status === 'published' ? '已发布' : track.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-cosmos-dim">
                  <span>{track.moduleCount} 模块</span>
                  <span>{track.lessonCount} 课时</span>
                  <Link
                    href={`/cms/editor/${track.slug}`}
                    className="text-stellar-blue hover:text-stellar-violet"
                  >
                    编辑 →
                  </Link>
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
