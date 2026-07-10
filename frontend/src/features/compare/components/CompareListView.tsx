'use client';

import { useLocale } from 'next-intl';
import { useCompareList } from '../hooks/useCompare';
import { CompareArticleCard } from './CompareArticleCard';

function CompareListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((item) => (
        <div key={item} className="bg-cosmos-surface rounded-lg p-6 border border-cosmos-border animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-24 bg-cosmos-border rounded" />
            <div className="h-3 w-16 bg-cosmos-border rounded" />
          </div>
          <div className="h-7 bg-cosmos-border rounded w-3/4 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-cosmos-border rounded w-full" />
            <div className="h-4 bg-cosmos-border rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CompareListView() {
  const locale = useLocale();
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    filteredArticles,
    loading,
    error,
  } = useCompareList();

  if (loading) return <CompareListSkeleton />;

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-4 py-3 rounded-lg">
        <p>加载选型数据时出错: {error}</p>
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="bg-cosmos-surface border border-cosmos-border text-cosmos-dim px-4 py-8 rounded-lg text-center">
        暂无技术选型文章。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selectedCategory === ''
                ? 'bg-cosmos-text text-cosmos-surface border-cosmos-text'
                : 'border-cosmos-border text-cosmos-dim hover:text-cosmos-text'
            }`}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-cosmos-text text-cosmos-surface border-cosmos-text'
                  : 'border-cosmos-border text-cosmos-dim hover:text-cosmos-text'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {filteredArticles.map((article) => (
        <CompareArticleCard key={article.id} article={article} categories={categories} locale={locale} />
      ))}
    </div>
  );
}
