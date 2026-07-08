'use client';

import { useRadarList } from '../hooks/useRadar';
import { RadarCategoryFilter } from './RadarCategoryFilter';
import { RadarItemCard } from './RadarItemCard';

function RadarListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((item) => (
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
          <div className="mt-4 flex gap-2">
            <div className="h-6 bg-cosmos-border rounded w-20" />
            <div className="h-6 bg-cosmos-border rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RadarListView() {
  const {
    items,
    categories,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    loading,
    error,
  } = useRadarList();

  if (loading) return <RadarListSkeleton />;

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-4 py-3 rounded-lg">
        <p>加载雷达数据时出错: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RadarCategoryFilter
        items={items}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {selectedCategory && (
        <div className="bg-cosmos-surface/50 rounded-lg p-4 border border-cosmos-border">
          <p className="text-cosmos-dim text-sm">
            {categories.find((category) => category.id === selectedCategory)?.description}
          </p>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-cosmos-dim">暂无选中类别的技术雷达项目</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item) => (
            <RadarItemCard key={item.id} item={item} categories={categories} />
          ))}
        </div>
      )}
    </div>
  );
}
