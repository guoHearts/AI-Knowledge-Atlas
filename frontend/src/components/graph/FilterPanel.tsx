'use client';

import type { NodeType } from '@/types/graph';
import { NODE_COLORS, NODE_LABELS } from '@/types/graph';

const NODE_TYPES: NodeType[] = [
  'Technology', 'Model', 'Product', 'AgentFramework',
  'AgentType', 'Company', 'Paper', 'Benchmark',
];

interface Props {
  activeTypes: NodeType[];
  onToggle: (type: NodeType) => void;
  onClear: () => void;
  onSelectAll: () => void;
}

export function FilterPanel({ activeTypes, onToggle, onClear, onSelectAll }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {NODE_TYPES.map((type) => {
        const isActive = activeTypes.length === 0 || activeTypes.includes(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border ${
              isActive
                ? 'border-white/10 text-cosmos-text'
                : 'border-transparent text-cosmos-dim opacity-40 hover:opacity-70'
            }`}
            style={{
              backgroundColor: isActive ? `${NODE_COLORS[type]}15` : 'transparent',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: NODE_COLORS[type] }}
            />
            {NODE_LABELS[type]}
          </button>
        );
      })}
      {activeTypes.length > 0 && (
        <button
          onClick={onClear}
          className="text-[10px] text-cosmos-dim hover:text-cosmos-text px-2 py-1"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
