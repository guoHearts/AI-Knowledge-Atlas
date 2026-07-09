import Link from 'next/link';
import type { CompareArticle, CompareCategory } from '../types/compare.types';

const STATUS_COLORS = {
  Verified: 'bg-stellar-green/15 text-stellar-green border-stellar-green/30',
  Draft: 'bg-cosmos-bg text-cosmos-dim border-cosmos-border',
  Stale: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30',
  Deprecated: 'bg-red-500/15 text-red-700 border-red-500/30',
};

export function getStatusColor(status: string) {
  return (
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    'bg-gray-500/20 text-gray-700 border-gray-500/30'
  );
}

interface CompareArticleCardProps {
  article: CompareArticle;
  categories: CompareCategory[];
}

export function CompareArticleCard({ article, categories }: CompareArticleCardProps) {
  const categoryName =
    categories.find((category) => category.id === article.category)?.name || article.category;

  return (
    <div className="bg-cosmos-surface rounded-lg p-6 border border-cosmos-border hover:border-cosmos-text transition-colors">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="px-2 py-1 rounded text-xs font-medium border border-indigo-500/30 bg-indigo-500/20 text-indigo-700">
          {categoryName}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(article.status)}`}>
          {article.status}
        </span>
        <span className="px-2 py-1 rounded text-xs font-medium border border-cosmos-border text-cosmos-dim">
          {article.contenders.length} 个方案对比
        </span>
      </div>

      <h2 className="font-semibold text-xl text-cosmos-text mb-3">{article.title}</h2>

      <p className="text-cosmos-dim mb-4 leading-relaxed">{article.summary}</p>

      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-cosmos-border">
        <Link
          href={`/compare/${article.id}`}
          className="inline-flex items-center text-stellar-green hover:text-stellar-green/80 font-medium text-sm transition-colors"
        >
          查看详情
        </Link>

        {article.related_lab_ids[0] && (
          <Link
            href={`/labs/${article.related_lab_ids[0]}`}
            className="inline-flex items-center text-stellar-green hover:text-stellar-green/80 font-medium text-sm transition-colors"
          >
            运行实验
          </Link>
        )}

        <div className="flex items-center gap-2 text-cosmos-dim text-xs">
          <span>最后验证: {new Date(article.last_verified_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
