'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SearchBar } from '@/components/graph/SearchBar';
import { FilterPanel } from '@/components/graph/FilterPanel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { fetchGraphNodes, fetchGraphEdges, searchNodes, fetchNodeDetail, fetchSubgraph } from '@/lib/api';
import type { GraphNode, GraphEdge, NodeDetail, NodeType } from '@/types/graph';
import { NODE_COLORS, NODE_LABELS, RELATION_EXPLAINERS, RELATION_LABELS } from '@/types/graph';

const GraphCanvas = dynamic(() => import('@/components/graph/GraphCanvas').then(m => ({ default: m.GraphCanvas })), {
  ssr: false,
  loading: () => <LoadingSpinner text="正在加载图谱画布..." />,
});

const NodeDetailPanel = dynamic(() => import('@/components/graph/NodeDetail').then(m => ({ default: m.NodeDetailPanel })), {
  ssr: false,
});

const NODE_TYPE_ORDER: NodeType[] = [
  'Technology',
  'Model',
  'Product',
  'AgentFramework',
  'AgentType',
  'Company',
  'Paper',
  'Benchmark',
];

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

  useEffect(() => {
    if (focusId) {
      handleNodeClick('Technology', focusId);
    }
  }, [focusId, handleNodeClick]);

  const handleNodeDblClick = useCallback(async (nodeType: string, nodeId: string) => {
    try {
      const subgraph = await fetchSubgraph([nodeId], 1);
      setNodes((prev) => {
        const existingIds = new Set(prev.map((node) => node.id));
        const newNodes = subgraph.nodes.filter((node) => !existingIds.has(node.id));
        return [...prev, ...newNodes];
      });
      setEdges((prev) => {
        const existingKeys = new Set(prev.map((edge) => `${edge.source_id}|${edge.target_id}|${edge.relation}`));
        const newEdges = subgraph.edges.filter((edge) => !existingKeys.has(`${edge.source_id}|${edge.target_id}|${edge.relation}`));
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

  const handleFocusDone = useCallback(() => {
    setFocusNodeId(null);
  }, []);

  const handleCanvasNodeClick = useCallback((node: GraphNode) => {
    handleNodeClick(node.node_type, node.id);
  }, [handleNodeClick]);

  const handleCanvasNodeDblClick = useCallback((node: GraphNode) => {
    handleNodeDblClick(node.node_type, node.id);
  }, [handleNodeDblClick]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setHighlightNodeId(null);
  }, []);

  const toggleFilter = useCallback((type: NodeType) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  }, []);

  const counts = NODE_TYPE_ORDER.map((type) => ({
    type,
    count: nodes.filter((node) => node.node_type === type).length,
  }));

  if (loading) return <LoadingSpinner text="正在加载知识图谱..." />;

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col overflow-hidden">
      <div className="border-b border-cosmos-border bg-cosmos-surface/92 backdrop-blur-xl">
        <div className="grid gap-3 px-5 py-4 xl:grid-cols-[minmax(320px,500px)_1fr] xl:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-8 bg-cosmos-text" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cosmos-dim">Graph Workspace</span>
            </div>
            <SearchBar onSelectNode={handleSearchSelect} searchFn={handleSearch} />
          </div>
          <div className="space-y-3">
            <FilterPanel
              activeTypes={filterTypes}
              onToggle={toggleFilter}
              onClear={() => setFilterTypes([])}
              onSelectAll={() => setFilterTypes([])}
            />
            <p className="max-w-4xl text-xs leading-5 text-cosmos-dim">
              点击节点查看解释，双击展开一度邻居。颜色代表实体类型，连线代表依赖、发布、竞争、评测等关系。
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex-1">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            filterTypes={filterTypes}
            highlightNodeId={highlightNodeId}
            focusNodeId={focusNodeId}
            onFocusDone={handleFocusDone}
            onNodeClick={handleCanvasNodeClick}
            onNodeDblClick={handleCanvasNodeDblClick}
          />

          <div className="absolute bottom-4 left-4 max-w-[420px] border border-cosmos-border bg-cosmos-surface/94 p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between gap-6">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-cosmos-dim">Legend</span>
              <span className="text-xs font-semibold text-cosmos-text">{nodes.length} 节点 / {edges.length} 关系</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-cosmos-dim">
              {counts.map(({ type, count }) => (
                <span key={type} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: NODE_COLORS[type] }} />
                  {NODE_LABELS[type]} {count}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute right-4 top-4 hidden max-w-xs border border-cosmos-border bg-cosmos-surface/94 p-3 shadow-lg lg:block">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-cosmos-dim">Relations</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(RELATION_LABELS).slice(0, 6).map(([relation, label]) => (
                <span
                  key={relation}
                  title={RELATION_EXPLAINERS[relation as keyof typeof RELATION_EXPLAINERS]}
                  className="rounded-md border border-cosmos-border bg-cosmos-bg px-2 py-1 text-[10px] font-semibold text-cosmos-text"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {!panelOpen && selectedNode?.node && (
            <button
              onClick={() => setPanelOpen(true)}
              className="absolute bottom-4 right-4 border border-cosmos-text bg-cosmos-text px-4 py-2.5 text-xs font-bold text-cosmos-surface shadow-[5px_5px_0_rgba(35,88,216,0.18)] transition-transform hover:-translate-y-0.5"
            >
              查看节点详情
            </button>
          )}
        </div>

        {panelOpen && (
          <aside className="w-96 shrink-0 overflow-hidden border-l border-cosmos-border bg-cosmos-surface/96 shadow-2xl">
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
    <Suspense fallback={<LoadingSpinner text="正在加载知识图谱..." />}>
      <GraphPageInner />
    </Suspense>
  );
}
