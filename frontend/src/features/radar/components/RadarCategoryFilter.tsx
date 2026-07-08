'use client';

import type { RadarCategory, RadarItem } from '../types/radar.types';

interface RadarCategoryFilterProps {
  items: RadarItem[];
  categories: RadarCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function RadarCategoryFilter({
  items,
  categories,
  selectedCategory,
  onSelectCategory,
}: RadarCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory('')}
        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
          selectedCategory === ''
            ? 'bg-stellar-green text-white border-stellar-green'
            : 'bg-cosmos-surface text-cosmos-text border-cosmos-border hover:border-cosmos-text'
        }`}
      >
        全部 ({items.length})
      </button>
      {categories.map((category) => {
        const count = items.filter((item) => item.category === category.id).length;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              selectedCategory === category.id
                ? 'bg-stellar-green text-white border-stellar-green'
                : 'bg-cosmos-surface text-cosmos-text border-cosmos-border hover:border-cosmos-text'
            }`}
          >
            {category.name} ({count})
          </button>
        );
      })}
    </div>
  );
}
