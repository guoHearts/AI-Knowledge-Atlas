'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GraphNode } from '@/types/graph';
import { NODE_COLORS, NODE_LABELS, NodeType } from '@/types/graph';

interface Props {
  onSelectNode: (node: GraphNode) => void;
  searchFn: (query: string) => Promise<GraphNode[]>;
}

export function SearchBar({ onSelectNode, searchFn }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GraphNode[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
    <div ref={containerRef} className="relative flex-1 max-w-lg">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmos-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="搜索技术/模型/产品/公司..."
          className="w-full bg-cosmos-bg/50 border border-cosmos-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-cosmos-text placeholder:text-cosmos-dim focus:outline-none focus:border-stellar-blue/40 transition-colors"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-stellar-blue/30 border-t-stellar-blue rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass-panel rounded-xl overflow-hidden shadow-2xl z-50 max-h-80 overflow-y-auto">
          {results.map((node) => (
            <button
              key={node.id}
              onClick={() => {
                onSelectNode(node);
                setQuery(node.name);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left border-b border-cosmos-border last:border-b-0"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: NODE_COLORS[node.node_type as NodeType] }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-cosmos-text">{node.name}</span>
                {node.summary_zh && (
                  <span className="text-[10px] text-cosmos-dim ml-2">{node.summary_zh}</span>
                )}
              </div>
              <span className="text-[10px] text-cosmos-dim bg-cosmos-bg/50 px-2 py-0.5 rounded">
                {NODE_LABELS[node.node_type as NodeType]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
