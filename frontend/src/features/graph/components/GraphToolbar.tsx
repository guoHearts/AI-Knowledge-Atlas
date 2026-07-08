'use client';

import { FilterPanel } from './FilterPanel';
import { SearchBar } from './SearchBar';
import type { GraphNode, NodeType } from '../types/graph.types';

interface GraphToolbarProps {
  filterTypes: NodeType[];
  onToggleFilter: (type: NodeType) => void;
  onClearFilter: () => void;
  onSelectAllFilters: () => void;
  onSearch: (query: string) => Promise<GraphNode[]>;
  onSearchSelect: (node: GraphNode) => void;
}

export function GraphToolbar({
  filterTypes,
  onToggleFilter,
  onClearFilter,
  onSelectAllFilters,
  onSearch,
  onSearchSelect,
}: GraphToolbarProps) {
  return (
    <div className="border-b border-cosmos-border bg-cosmos-surface/92 backdrop-blur-xl">
      <div className="grid gap-3 px-5 py-4 xl:grid-cols-[minmax(320px,500px)_1fr] xl:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-8 bg-cosmos-text" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cosmos-dim">Graph Workspace</span>
          </div>
          <SearchBar onSelectNode={onSearchSelect} searchFn={onSearch} />
        </div>
        <div className="space-y-3">
          <FilterPanel
            activeTypes={filterTypes}
            onToggle={onToggleFilter}
            onClear={onClearFilter}
            onSelectAll={onSelectAllFilters}
          />
          <p className="max-w-4xl text-xs leading-5 text-cosmos-dim">
            点击节点查看解释，双击展开一度邻居。颜色代表实体类型，连线代表依赖、发布、竞争、评测等关系。
          </p>
        </div>
      </div>
    </div>
  );
}
