import { useState, useRef } from 'react';
import type { GraphNode } from '../types/graph';
import { NODE_COLORS, NODE_LABELS } from '../types/graph';

interface Props {
  onSelectNode: (node: GraphNode) => void;
  searchFn: (query: string) => Promise<GraphNode[]>;
}

export default function SearchBar({ onSelectNode, searchFn }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GraphNode[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(timerRef.current);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = window.setTimeout(async () => {
      const r = await searchFn(value);
      setResults(r);
      setOpen(r.length > 0);
    }, 250);
  };

  return (
    <div className="relative">
      {/* Search icon + input */}
      <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
        focused
          ? 'bg-cosmos-surface/90 border-stellar-blue/40 shadow-[0_0_20px_rgba(91,156,245,0.08)]'
          : 'bg-cosmos-surface/60 border-cosmos-border'
      } border`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={focused ? '#5b9cf5' : '#5c6a85'} strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="搜索技术、模型、产品..."
          className="flex-1 bg-transparent text-sm text-cosmos-text placeholder:text-cosmos-muted outline-none font-body"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            className="text-cosmos-muted hover:text-cosmos-text transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto animate-fade-up">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-cosmos-muted">未找到结果</div>
          ) : (
            results.map((node, i) => (
              <button
                key={node.id}
                onClick={() => { onSelectNode(node); setOpen(false); setQuery(''); }}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.04] flex items-center gap-3 transition-colors"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/20"
                  style={{ backgroundColor: NODE_COLORS[node.node_type] }}
                />
                <span className="text-sm font-medium text-cosmos-text font-body flex-1">{node.name}</span>
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded font-display tracking-wide"
                  style={{
                    color: NODE_COLORS[node.node_type],
                    background: `${NODE_COLORS[node.node_type]}12`,
                  }}
                >
                  {NODE_LABELS[node.node_type]}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
