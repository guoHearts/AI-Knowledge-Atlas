'use client';

import type { NodeType } from '@/types/graph';
import { NODE_COLORS, NODE_EXPLAINERS, NODE_LABELS } from '@/types/graph';

const NODE_TYPES: NodeType[] = [
  'Technology',
  'Model',
  'Product',
  'AgentFramework',
  'AgentType',
  'Company',
  'Paper',
  'Benchmark',
];

interface Props {
  activeTypes: NodeType[];
  onToggle: (type: NodeType) => void;
  onClear: () => void;
  onSelectAll: () => void;
}

export function FilterPanel({ activeTypes, onToggle, onClear }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {NODE_TYPES.map((type) => {
        const isActive = activeTypes.length === 0 || activeTypes.includes(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            title={NODE_EXPLAINERS[type]}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-bold transition-all duration-200 ${
              isActive
                ? 'border-cosmos-text bg-cosmos-surface text-cosmos-text shadow-[3px_3px_0_rgba(23,32,28,0.08)]'
                : 'border-cosmos-border bg-cosmos-bg/70 text-cosmos-dim opacity-70 hover:opacity-100'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: NODE_COLORS[type] }}
            />
            {NODE_LABELS[type]}
          </button>
        );
      })}
      {activeTypes.length > 0 && (
        <button
          onClick={onClear}
          className="border border-cosmos-border bg-cosmos-bg/70 px-3 py-1.5 text-[11px] font-bold text-cosmos-dim hover:border-cosmos-text hover:text-cosmos-text"
        >
          显示全部
        </button>
      )}
    </div>
  );
}
