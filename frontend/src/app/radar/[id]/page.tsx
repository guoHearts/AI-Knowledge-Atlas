import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RadarItem } from '../radar-types'

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

async function getRadarItem(id: string): Promise<RadarItem | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/radar/items/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    })
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch radar item')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching radar item:', error)
    return null
  }
}

const MATURITY_COLORS = {
  "Early Production": "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  "Validated": "bg-green-500/20 text-green-700 border-green-500/30",
  "Production-Ready": "bg-blue-500/20 text-blue-700 border-blue-500/30",
}

const CATEGORY_COLORS = {
  "agent-framework": "bg-purple-500/20 text-purple-700 border-purple-500/30",
  "mcp": "bg-indigo-500/20 text-indigo-700 border-indigo-500/30",
  "rag": "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
  "evaluation": "bg-orange-500/20 text-orange-700 border-orange-500/30",
  "llmops": "bg-cyan-500/20 text-cyan-700 border-cyan-500/30",
  "model": "bg-pink-500/20 text-pink-700 border-pink-500/30",
}

export default async function RadarItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const radarItem = await getRadarItem(id)
  
  if (!radarItem) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/radar"
            className="inline-flex items-center text-stellar-green hover:text-stellar-green/80 font-medium mb-4 transition-colors"
          >
            ← 返回雷达
          </Link>
          
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmos-border bg-cosmos-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cosmos-dim">
            <span className="h-2 w-2 rounded-full bg-stellar-green" />
            AI Engineering Radar
          </div>
        </div>

        {/* Content */}
        <div className="bg-cosmos-surface rounded-lg p-8 border border-cosmos-border">
          {/* Tags */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${CATEGORY_COLORS[radarItem.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}`}>
              {radarItem.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${MATURITY_COLORS[radarItem.maturity as keyof typeof MATURITY_COLORS] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}`}>
              {radarItem.maturity}
            </span>
            {radarItem.has_lab && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-stellar-green text-white">
                有实验
              </span>
            )}
          </div>
          
          {/* Title */}
          <h1 className="font-display text-3xl font-bold leading-tight text-cosmos-text mb-6">
            {radarItem.title}
          </h1>
          
          {/* Summary */}
          <div className="mb-8">
            <p className="text-lg text-cosmos-dim leading-relaxed">
              {radarItem.summary}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-8">
            {/* Why it matters */}
            <section>
              <h2 className="text-xl font-semibold text-cosmos-text mb-3">为什么重要</h2>
              <p className="text-cosmos-dim leading-relaxed">
                {radarItem.why_it_matters}
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Recommended for */}
              <section>
                <h2 className="text-lg font-semibold text-cosmos-text mb-3">适合</h2>
                <p className="text-cosmos-dim leading-relaxed">
                  {radarItem.recommended_for}
                </p>
              </section>

              {/* Not recommended for */}
              {radarItem.not_recommended_for && (
                <section>
                  <h2 className="text-lg font-semibold text-cosmos-text mb-3">不适合</h2>
                  <p className="text-cosmos-dim leading-relaxed">
                    {radarItem.not_recommended_for}
                  </p>
                </section>
              )}
            </div>

            {/* Lab Link */}
            {radarItem.has_lab && radarItem.lab_id && (
              <section>
                <h2 className="text-xl font-semibold text-cosmos-text mb-3">动手实验</h2>
                <div className="bg-stellar-green/10 border border-stellar-green/30 rounded-lg p-4">
                  <p className="text-cosmos-dim mb-3">
                    通过配套实验验证这项技术的适用边界和运行结果。
                  </p>
                  <Link
                    href={`/labs/${radarItem.lab_id}`}
                    className="inline-flex items-center bg-stellar-green hover:bg-stellar-green/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    运行实验
                  </Link>
                </div>
              </section>
            )}

            {/* Sources */}
            {radarItem.sources && radarItem.sources.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-cosmos-text mb-3">来源与引用</h2>
                <div className="space-y-3">
                  {radarItem.sources.map((source, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-cosmos-surface/50 rounded-lg border border-cosmos-border/50">
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          source.type === 'official' ? 'bg-stellar-green' :
                          source.type === 'blog' ? 'bg-stellar-blue' :
                          source.type === 'research' ? 'bg-purple-500' :
                          'bg-cosmos-dim'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-cosmos-text mb-1">{source.title}</h3>
                        <div className="flex items-center gap-2">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cosmos-dim hover:text-cosmos-text transition-colors underline"
                          >
                            查看原文
                          </a>
                          <span className="text-xs text-cosmos-dim">
                            {source.type === 'official' ? '官方' :
                             source.type === 'blog' ? '博客' :
                             source.type === 'research' ? '研究' :
                             source.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Metadata */}
            <section className="pt-6 border-t border-cosmos-border">
              <h2 className="text-lg font-semibold text-cosmos-text mb-3">元数据</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-cosmos-dim">ID:</span>
                  <code className="ml-2 text-cosmos-text font-mono">{radarItem.id}</code>
                </div>
                <div>
                  <span className="text-cosmos-dim">创建时间:</span>
                  <span className="ml-2 text-cosmos-text">{new Date(radarItem.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div>
                  <span className="text-cosmos-dim">最后更新:</span>
                  <span className="ml-2 text-cosmos-text">{new Date(radarItem.updated_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div>
                  <span className="text-cosmos-dim">最后验证:</span>
                  <span className="ml-2 text-cosmos-text">{new Date(radarItem.last_verified_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-cosmos-border">
            <Link
              href="/radar"
              className="inline-flex items-center bg-stellar-green hover:bg-stellar-green/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              查看完整雷达
            </Link>
            
            {radarItem.has_lab && radarItem.lab_id && (
              <Link
                href={`/labs/${radarItem.lab_id}`}
                className="inline-flex items-center border border-stellar-green text-stellar-green hover:bg-stellar-green/10 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                运行实验
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            )}
            
            <Link
              href="/docs/tech-comparisons"
              className="inline-flex items-center border border-cosmos-border text-cosmos-dim hover:text-cosmos-text px-4 py-2 rounded-lg font-medium transition-colors"
            >
              查看技术对比
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
