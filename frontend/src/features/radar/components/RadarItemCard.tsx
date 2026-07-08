import Link from 'next/link';
import type { RadarCategory, RadarItem } from '../types/radar.types';

const MATURITY_COLORS = {
  'Early Adoption': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Production Ready': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Mature: 'bg-green-500/20 text-green-700 border-green-500/30',
  Experimental: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
};

const CATEGORY_COLORS = {
  'agent-framework': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  mcp: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
  rag: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  evaluation: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  llmops: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
  model: 'bg-pink-500/20 text-pink-700 border-pink-500/30',
};

const STATUS_COLORS = {
  Verified: 'bg-stellar-green/15 text-stellar-green border-stellar-green/30',
  Draft: 'bg-cosmos-bg text-cosmos-dim border-cosmos-border',
  Stale: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30',
  Deprecated: 'bg-red-500/15 text-red-700 border-red-500/30',
};

interface RadarItemCardProps {
  item: RadarItem;
  categories: RadarCategory[];
}

export function getCategoryColor(category: string) {
  return (
    CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ||
    'bg-gray-500/20 text-gray-700 border-gray-500/30'
  );
}

export function getMaturityColor(maturity: string) {
  return (
    MATURITY_COLORS[maturity as keyof typeof MATURITY_COLORS] ||
    'bg-gray-500/20 text-gray-700 border-gray-500/30'
  );
}

export function getStatusColor(status: string) {
  return (
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    'bg-gray-500/20 text-gray-700 border-gray-500/30'
  );
}

export function RadarItemCard({ item, categories }: RadarItemCardProps) {
  return (
    <div className="bg-cosmos-surface rounded-lg p-6 border border-cosmos-border hover:border-cosmos-text transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(item.category)}`}>
          {categories.find((category) => category.id === item.category)?.name || item.category}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getMaturityColor(item.maturity)}`}>
          {item.maturity}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
          {item.status}
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
        <Link
          href={`/radar/${item.id}`}
          className="inline-flex items-center text-stellar-green hover:text-stellar-green/80 font-medium text-sm transition-colors"
        >
          查看详情
        </Link>

        {item.has_lab && item.lab_id && (
          <Link
            href={`/labs/${item.lab_id}`}
            className="inline-flex items-center text-stellar-green hover:text-stellar-green/80 font-medium text-sm transition-colors"
          >
            运行实验
          </Link>
        )}

        <div className="flex items-center gap-2 text-cosmos-dim text-xs">
          <span>最后验证: {new Date(item.last_verified_at).toLocaleDateString()}</span>
        </div>

        {item.related_node_ids.length > 0 && (
          <div className="flex items-center gap-1 text-cosmos-dim text-xs">
            <span>关联:</span>
            <span>{item.related_node_ids.slice(0, 2).join(' / ')}</span>
          </div>
        )}

        {item.sources.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-cosmos-dim text-xs">来源:</span>
            {item.sources.slice(0, 2).map((source) => (
              <a
                key={source.url}
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
  );
}
