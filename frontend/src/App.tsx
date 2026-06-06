import { useState, useCallback } from 'react';
import GraphCanvas from './components/GraphCanvas';
import NodeDetailPanel from './components/NodeDetail';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import ChatPanel from './components/ChatPanel';
import { useGraphData } from './hooks/useGraphData';
import type { GraphNode, NodeType } from './types/graph';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const { nodes, edges, loading, selectedNode, selectNode, search, expandNode } = useGraphData();
  const [filterTypes, setFilterTypes] = useState<NodeType[]>([]);
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleNodeClick = useCallback((node: GraphNode) => {
    selectNode(node.node_type, node.id);
    setHighlightNodeId(node.id);
    setPanelOpen(true);
  }, [selectNode]);

  const handleNodeDblClick = useCallback((node: GraphNode) => {
    expandNode(node.id);
    selectNode(node.node_type, node.id);
    setHighlightNodeId(node.id);
    setPanelOpen(true);
  }, [selectNode, expandNode]);

  const handleSearchSelect = useCallback((node: GraphNode) => {
    selectNode(node.node_type, node.id);
    setHighlightNodeId(node.id);
    setFocusNodeId(node.id);
    setPanelOpen(true);
  }, [selectNode]);

  const handleFocusNode = useCallback((nodeType: string, nodeId: string) => {
    selectNode(nodeType, nodeId);
    setHighlightNodeId(nodeId);
  }, [selectNode]);

  const handleExplore = useCallback((_nodeId: string) => {
    setShowChat(true);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/share/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_ids: highlightNodeId ? [highlightNodeId] : [],
          node_types: filterTypes,
          view_center: highlightNodeId,
          zoom: 1.0,
        }),
      });
      const data = await res.json();
      setShareUrl(data.url);
      setTimeout(() => setShareUrl(null), 6000);
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [highlightNodeId, filterTypes]);

  const toggleFilter = useCallback((type: NodeType) => {
    setFilterTypes(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type);
      return [...prev, type];
    });
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setHighlightNodeId(null);
  }, []);

  // ─── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-cosmos-bg">
        <div className="text-center">
          {/* Pulsing rings */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border border-stellar-blue/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-stellar-blue/30" style={{ animation: 'pulse-ring 1.8s ease-out infinite' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-stellar-blue shadow-[0_0_16px_rgba(91,156,245,0.5)]" />
            </div>
          </div>
          <p className="text-cosmos-dim text-sm font-body tracking-wide">加载知识图谱...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-cosmos-bg overflow-hidden">
      {/* ─── Top bar ──────────────────────────────────── */}
      <header className="glass-panel shrink-0 z-30 relative">
        <div className="flex items-center gap-4 px-5 py-3">
          {/* Logo area */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(91,156,245,0.25), rgba(167,139,250,0.2))' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b9cf5" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-cosmos-text font-display tracking-tight leading-tight">
                AI 知识图谱
              </h1>
              <p className="text-[10px] text-cosmos-dim font-display tracking-wider">FRONTIER RADAR</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg">
            <SearchBar onSelectNode={handleSearchSelect} searchFn={search} />
          </div>

          {/* Filters */}
          <div className="hidden xl:block">
            <FilterPanel
              activeTypes={filterTypes}
              onToggle={toggleFilter}
              onClear={() => setFilterTypes([])}
              onSelectAll={() => setFilterTypes([])}
            />
          </div>

          {/* Chat button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold font-display tracking-wide transition-all duration-200 border ${
              showChat
                ? 'border-stellar-violet/40 text-stellar-violet bg-stellar-violet/10'
                : 'border-cosmos-border text-cosmos-dim hover:text-cosmos-text hover:border-white/15 hover:bg-white/[0.03]'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            AI 对话
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold font-display tracking-wide transition-all duration-200 border border-cosmos-border text-cosmos-dim hover:text-cosmos-text hover:border-white/15 hover:bg-white/[0.03]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            分享
          </button>
        </div>

        {/* Mobile filter row */}
        <div className="xl:hidden px-5 pb-3">
          <FilterPanel
            activeTypes={filterTypes}
            onToggle={toggleFilter}
            onClear={() => setFilterTypes([])}
            onSelectAll={() => setFilterTypes([])}
          />
        </div>
      </header>

      {/* ─── Share toast ──────────────────────────────── */}
      {shareUrl && (
        <div className="fixed top-20 right-5 z-50 glass-panel rounded-xl p-4 max-w-sm shadow-2xl animate-slide-in">
          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-xs font-semibold text-cosmos-text font-display">链接已复制</p>
          </div>
          <input
            readOnly
            value={shareUrl}
            className="w-full text-xs bg-cosmos-bg/70 border border-cosmos-border rounded-lg px-3 py-2 text-cosmos-text font-mono"
            onFocus={e => { e.target.select(); navigator.clipboard.writeText(shareUrl); }}
          />
        </div>
      )}

      {/* ─── Main content ─────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph canvas — full area */}
        <div className="flex-1 relative">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            filterTypes={filterTypes}
            highlightNodeId={highlightNodeId}
            focusNodeId={focusNodeId}
            onFocusDone={() => setFocusNodeId(null)}
            onNodeClick={handleNodeClick}
            onNodeDblClick={handleNodeDblClick}
          />

          {/* Stats badge */}
          <div className="absolute bottom-4 left-4 glass-panel rounded-lg px-3 py-1.5 text-[11px] text-cosmos-dim font-display tracking-wide pointer-events-none">
            <span className="text-cosmos-text font-semibold">{nodes.length}</span> 节点
            <span className="mx-1.5 opacity-30">·</span>
            <span className="text-cosmos-text font-semibold">{edges.length}</span> 关系
          </div>

          {/* Panel toggle button (when panel is closed) */}
          {!panelOpen && selectedNode?.node && (
            <button
              onClick={() => setPanelOpen(true)}
              className="absolute bottom-4 right-4 glass-panel rounded-xl px-4 py-2.5 text-xs font-semibold text-stellar-blue font-display tracking-wide hover:bg-stellar-blue/10 transition-all animate-fade-up"
            >
              查看详情 →
            </button>
          )}
        </div>

        {/* Right detail panel */}
        {panelOpen && (
          <aside className="w-96 border-l border-cosmos-border glass-panel overflow-hidden flex flex-col shrink-0 animate-slide-in">
            <NodeDetailPanel
              detail={selectedNode}
              onClose={closePanel}
              onFocusNode={handleFocusNode}
              onExplore={handleExplore}
            />
          </aside>
        )}
      </div>

      {/* ─── Chat panel ───────────────────────────────── */}
      {showChat && (
        <div className="h-80 border-t border-cosmos-border glass-panel shrink-0">
          <ChatPanel
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            onFocusNode={handleFocusNode}
          />
        </div>
      )}
    </div>
  );
}
