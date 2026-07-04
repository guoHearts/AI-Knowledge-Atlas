'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SearchBar } from '@/components/graph/SearchBar';
import { FilterPanel } from '@/components/graph/FilterPanel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { fetchGraphNodes, fetchGraphEdges, searchNodes, fetchNodeDetail, fetchSubgraph } from '@/lib/api';
import type { GraphNode, GraphEdge, NodeDetail, NodeType } from '@/types/graph';
import { NODE_LABELS } from '@/types/graph';

// Dynamic import for D3 component (SSR incompatible)
const GraphCanvas = dynamic(() => import('@/components/graph/GraphCanvas').then(m => ({ default: m.GraphCanvas })), {
  ssr: false,
  loading: () => <LoadingSpinner text="加载图谱画布..." />,
});

const NodeDetailPanel = dynamic(() => import('@/components/graph/NodeDetail').then(m => ({ default: m.NodeDetailPanel })), {
  ssr: false,
});

function GraphPageInner() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get('focus');

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(focusId);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(focusId);
  const [filterTypes, setFilterTypes] = useState<NodeType[]>([]);

  // Initial load
  useEffect(() => {
    async function load() {
      try {
        const [fetchedNodes, fetchedEdges] = await Promise.all([
          fetchGraphNodes({ limit: 500 }),
          fetchGraphEdges(2000),
        ]);
        setNodes(fetchedNodes);
        setEdges(fetchedEdges);
      } catch (err) {
        console.error('Failed to load graph:', err);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Focus on node from URL param
  useEffect(() => {
    if (focusId) {
      handleNodeClick('Technology', focusId);
    }
  }, [focusId]);

  const handleNodeClick = useCallback(async (nodeType: string, nodeId: string) => {
    try {
      const detail = await fetchNodeDetail(nodeType, nodeId);
      setSelectedNode(detail);
      setHighlightNodeId(nodeId);
      setPanelOpen(true);
    } catch (err) {
      console.error('Failed to fetch node:', err);
    }
  }, []);

  const handleNodeDblClick = useCallback(async (nodeType: string, nodeId: string) => {
    try {
      // Expand neighborhood
      const subgraph = await fetchSubgraph([nodeId], 1);
      setNodes(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNodes = subgraph.nodes.filter(n => !existingIds.has(n.id));
        return [...prev, ...newNodes];
      });
      setEdges(prev => {
        const existingKeys = new Set(prev.map(e => `${e.source_id}|${e.target_id}|${e.relation}`));
        const newEdges = subgraph.edges.filter(e => !existingKeys.has(`${e.source_id}|${e.target_id}|${e.relation}`));
        return [...prev, ...newEdges];
      });
      handleNodeClick(nodeType, nodeId);
    } catch (err) {
      console.error('Failed to expand:', err);
    }
  }, [handleNodeClick]);

  const handleSearch = useCallback(async (query: string): Promise<GraphNode[]> => {
    return searchNodes(query);
  }, []);

  const handleSearchSelect = useCallback((node: GraphNode) => {
    handleNodeClick(node.node_type, node.id);
    setHighlightNodeId(node.id);
    setFocusNodeId(node.id);
  }, [handleNodeClick]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setHighlightNodeId(null);
  }, []);

  const toggleFilter = useCallback((type: NodeType) => {
    setFilterTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }, []);

  if (loading) return <LoadingSpinner text="加载知识图谱..." />;

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="glass-panel shrink-0 z-30">
        <div className="flex items-center gap-4 px-5 py-3">
          <SearchBar onSelectNode={handleSearchSelect} searchFn={handleSearch} />
          <FilterPanel
            activeTypes={filterTypes}
            onToggle={toggleFilter}
            onClear={() => setFilterTypes([])}
            onSelectAll={() => setFilterTypes([])}
          />
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            filterTypes={filterTypes}
            highlightNodeId={highlightNodeId}
            focusNodeId={focusNodeId}
            onFocusDone={() => setFocusNodeId(null)}
            onNodeClick={(n: GraphNode) => handleNodeClick(n.node_type, n.id)}
            onNodeDblClick={(n: GraphNode) => handleNodeDblClick(n.node_type, n.id)}
          />

          {/* Stats badge */}
          <div className="absolute bottom-4 left-4 glass-panel rounded-lg px-3 py-1.5 text-[11px] text-cosmos-dim pointer-events-none">
            <span className="text-cosmos-text font-semibold">{nodes.length}</span> 节点
            <span className="mx-1.5 opacity-30">·</span>
            <span className="text-cosmos-text font-semibold">{edges.length}</span> 关系
          </div>

          {!panelOpen && selectedNode?.node && (
            <button
              onClick={() => setPanelOpen(true)}
              className="absolute bottom-4 right-4 glass-panel rounded-xl px-4 py-2.5 text-xs font-semibold text-stellar-blue hover:bg-stellar-blue/10 transition-all animate-fade-up"
            >
              查看详情 →
            </button>
          )}
        </div>

        {panelOpen && (
          <aside className="w-96 border-l border-cosmos-border glass-panel overflow-hidden flex flex-col shrink-0 animate-slide-in">
            <NodeDetailPanel
              detail={selectedNode}
              onClose={closePanel}
              onFocusNode={(nodeType: string, nodeId: string) => {
                handleNodeClick(nodeType, nodeId);
                setHighlightNodeId(nodeId);
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="加载知识图谱..." />}>
      <GraphPageInner />
    </Suspense>
  );
}
