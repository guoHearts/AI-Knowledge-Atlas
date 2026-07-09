import { Suspense } from 'react'
import Link from 'next/link'
import { RadarListView } from '@/features/radar'

export default function RadarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmos-border bg-cosmos-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cosmos-dim">
            <span className="h-2 w-2 rounded-full bg-stellar-green" />
            AI Engineering Radar
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-cosmos-text lg:text-5xl">
            本周 AI 技术雷达
          </h1>
          <p className="mt-4 text-lg text-cosmos-dim">
            每周精选值得关注的技术变化，帮你筛选真正重要的 AI 工程动向。
          </p>
        </div>

        <Suspense fallback={
          <div className="space-y-6">
            <div className="bg-cosmos-surface rounded-lg p-6 border border-cosmos-border animate-pulse">
              <div className="h-6 bg-cosmos-border rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-cosmos-border rounded w-1/2"></div>
            </div>
            <div className="bg-cosmos-surface rounded-lg p-6 border border-cosmos-border animate-pulse">
              <div className="h-6 bg-cosmos-border rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-cosmos-border rounded w-1/2"></div>
            </div>
          </div>
        }>
          <RadarListView />
        </Suspense>

        {/* Action Links */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <Link
            href="/compare"
            className="inline-block bg-stellar-green hover:bg-stellar-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            浏览技术选型地图
          </Link>
          <Link 
            href="/graph" 
            className="inline-block border border-cosmos-border hover:bg-cosmos-surface text-cosmos-text px-6 py-3 rounded-lg font-medium transition-colors"
          >
            探索知识图谱
          </Link>
        </div>
      </div>
    </div>
  )
}
