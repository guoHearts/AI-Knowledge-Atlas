import type { NodeType } from '../types/graph';
import { NODE_COLORS, NODE_LABELS } from '../types/graph';

interface Props {
  activeTypes: NodeType[];
  onToggle: (type: NodeType) => void;
  onClear: () => void;
  onSelectAll: () => void;
}

const ALL_TYPES: NodeType[] = [
  'Technology', 'Model', 'Product', 'AgentFramework', 'AgentType', 'Company', 'Paper', 'Benchmark'
];

export default function FilterPanel({ activeTypes, onToggle, onClear, onSelectAll }: Props) {
  const hasActiveFilter = activeTypes.length > 0;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {ALL_TYPES.map(type => {
        const isActive = !hasActiveFilter || activeTypes.includes(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className="relative px-2.5 py-1.5 rounded-lg text-[11px] font-semibold font-display tracking-wide transition-all duration-200"
            style={{
              color: isActive ? NODE_COLORS[type] : '#5c6a85',
              background: isActive ? `${NODE_COLORS[type]}14` : 'transparent',
              border: `1px solid ${isActive ? NODE_COLORS[type] + '30' : 'transparent'}`,
              boxShadow: isActive ? `0 0 12px ${NODE_COLORS[type]}10` : 'none',
            }}
          >
            {NODE_LABELS[type]}
          </button>
        );
      })}
      {/* Divider */}
      <span className="w-px h-4 bg-cosmos-border mx-1" />
      <button
        onClick={onClear}
        className="text-[11px] text-cosmos-dim hover:text-cosmos-text transition-colors font-display tracking-wide px-1"
      >
        清空
      </button>
      <button
        onClick={onSelectAll}
        className="text-[11px] text-cosmos-dim hover:text-cosmos-text transition-colors font-display tracking-wide px-1"
      >
        全选
      </button>
    </div>
  );
}
