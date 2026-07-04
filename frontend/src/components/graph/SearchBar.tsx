'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GraphNode, NodeType } from '@/types/graph';
import { NODE_COLORS, NODE_LABELS } from '@/types/graph';

interface Props {
  onSelectNode: (node: GraphNode) => void;
  searchFn: (query: string) => Promise<GraphNode[]>;
}

export function SearchBar({ onSelectNode, searchFn }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GraphNode[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (value.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    const found = await searchFn(value);
    setResults(found);
    setOpen(true);
    setSearching(false);
  }, [searchFn]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cosmos-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(event) => handleSearch(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="搜索 RAG、LangGraph、MCP、模型或公司..."
          className="h-12 w-full border border-cosmos-text bg-cosmos-surface pl-10 pr-10 text-sm font-semibold text-cosmos-text outline-none placeholder:text-cosmos-dim/75 focus:shadow-[5px_5px_0_rgba(35,88,216,0.18)]"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-stellar-blue/20 border-t-stellar-blue" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full z-50 mt-2 max-h-80 w-full overflow-y-auto border border-cosmos-text bg-cosmos-surface shadow-[8px_8px_0_rgba(23,32,28,0.12)]">
          {results.map((node) => (
            <button
              key={node.id}
              onClick={() => {
                onSelectNode(node);
                setQuery(node.name);
                setOpen(false);
              }}
              className="grid w-full grid-cols-[12px_1fr_auto] items-center gap-3 border-b border-cosmos-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-cosmos-bg"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: NODE_COLORS[node.node_type as NodeType] }}
              />
              <div className="min-w-0">
                <span className="text-sm font-bold text-cosmos-text">{node.name}</span>
                {node.summary_zh && (
                  <span className="ml-2 line-clamp-1 text-[10px] text-cosmos-dim">{node.summary_zh}</span>
                )}
              </div>
              <span className="border border-cosmos-border bg-cosmos-bg px-2 py-0.5 text-[10px] font-semibold text-cosmos-dim">
                {NODE_LABELS[node.node_type as NodeType]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
