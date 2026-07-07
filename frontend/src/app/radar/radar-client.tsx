"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RadarItem {
  id: string
  title: string
  category: string
  maturity: string
  summary: string
  why_it_matters: string
  recommended_for: string
  not_recommended_for: string
  has_lab: boolean
  lab_id: string | null
  sources: Array<{
    type: string
    url: string
    title: string
  }>
  created_at: string
  updated_at: string
  last_verified_at: string
}

interface RadarCategory {
  id: string
  name: string
  description: string
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

export default function RadarClient() {
  const [radarItems, setRadarItems] = useState<RadarItem[]>([])
  const [categories, setCategories] = useState<RadarCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRadarData() {
      try {
        setLoading(true)
        
        const itemsResponse = await fetch('/api/radar/items')
        if (!itemsResponse.ok) throw new Error('Failed to fetch radar items')
        const items = await itemsResponse.json()
        setRadarItems(items)
        
        const categoriesResponse = await fetch('/api/radar/categories')
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories')
        const cats = await categoriesResponse.json()
        setCategories(cats)
        
      } catch (err) {
        console.error('Failed to fetch radar data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchRadarData()
  }, [])

  const filteredItems = selectedCategory 
    ? radarItems.filter(item => item.category === selectedCategory)
    : radarItems

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-cosmos-surface rounded-lg p-6 border border-cosmos-border animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-24 bg-cosmos-border rounded"></div>
              <div className="h-3 w-16 bg-cosmos-border rounded"></div>
            </div>
            <div className="h-7 bg-cosmos-border rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-cosmos-border rounded w-full"></div>
              <div className="h-4 bg-cosmos-border rounded w-5/6"></div>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-6 bg-cosmos-border rounded w-20"></div>
              <div className="h-6 bg-cosmos-border rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-4 py-3 rounded-lg">
        <p>加载雷达数据时出错: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            selectedCategory === ''
              ? 'bg-stellar-green text-white border-stellar-green'
              : 'bg-cosmos-surface text-cosmos-text border-cosmos-border hover:border-cosmos-text'
          }`}
        >
          全部 ({radarItems.length})
        </button>
        {categories.map(category => {
          const count = radarItems.filter(item => item.category === category.id).length
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-stellar-green text-white border-stellar-green'
                  : 'bg-cosmos-surface text-cosmos-text border-cosmos-border hover:border-cosmos-text'
              }`}
            >
              {category.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Category Description */}
      {selectedCategory && (
        <div className="bg-cosmos-surface/50 rounded-lg p-4 border border-cosmos-border">
          <p className="text-cosmos-dim text-sm">
            {categories.find(c => c.id === selectedCategory)?.description}
          </p>
        </div>
      )}

      {/* Radar Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-cosmos-dim">暂无选中类别的技术雷达项目</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-cosmos-surface rounded-lg p-6 border border-cosmos-border hover:border-cosmos-text transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}`}>
                  {categories.find(c => c.id === item.category)?.name || item.category}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${MATURITY_COLORS[item.maturity as keyof typeof MATURITY_COLORS] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}`}>
                  {item.maturity}
                </span>
                {item.has_lab && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-stellar-green text-white">
                    有实验
                  </span>
                )}
              </div>
              
              <h2 className="font-semibold text-xl text-cosmos-text mb-3">
                {item.title}
              </h2>
              
              <p className="text-cosmos-dim mb-4 leading-relaxed">
                {item.summary}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium text-cosmos-text mb-2 text-sm">为什么重要</h3>
                  <p className="text-cosmos-dim text-sm leading-relaxed">{item.why_it_matters}</p>
                </div>
                <div>
                  <h3 className="font-medium text-cosmos-text mb-2 text-sm">适合谁</h3>
                  <p className="text-cosmos-dim text-sm leading-relaxed">{item.recommended_for}</p>
                </div>
              </div>
              
              {item.not_recommended_for && (
                <div className="mb-4">
                  <h3 className="font-medium text-cosmos-text mb-2 text-sm">不适合</h3>
                  <p className="text-cosmos-dim text-sm leading-relaxed">{item.not_recommended_for}</p>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-cosmos-border">
                {item.has_lab && item.lab_id && (
                  <Link
                    href={`/labs/${item.lab_id}`}
                    className="inline-flex items-center text-stellar-green hover:text-stellar-green/80 font-medium text-sm transition-colors"
                  >
                    运行实验 →
                  </Link>
                )}
                
                <div className="flex items-center gap-2 text-cosmos-dim text-xs">
                  <span>最后验证: {new Date(item.last_verified_at).toLocaleDateString()}</span>
                </div>
                
                {item.sources.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-cosmos-dim text-xs">来源:</span>
                    {item.sources.slice(0, 2).map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cosmos-dim hover:text-cosmos-text transition-colors underline"
                        title={source.title}
                      >
                        {source.type === 'official' ? '官方' : source.type === 'blog' ? '博客' : source.type}
                      </a>
                    ))}
                    {item.sources.length > 2 && (
                      <span className="text-xs text-cosmos-dim">+{item.sources.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
