import { useEffect, useState } from 'react';
import GraphCanvas from '../components/GraphCanvas';
import type { GraphNode, GraphEdge, NodeType } from '../types/graph';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ShareView() {
  const shareId = window.location.pathname.split('/s/')[1];
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFilters, setViewFilters] = useState<NodeType[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;
    setLoading(true);
    fetch(`${API_BASE}/share/${shareId}`)
      .then(r => {
        if (!r.ok) throw new Error('分享链接无效或已过期');
        return r.json();
      })
      .then(async (data) => {
        const nodeIds: string[] = data.node_ids || [];
        setViewFilters(data.node_types || []);
        if (data.view_center) setHighlightId(data.view_center);

        if (nodeIds.length > 0) {
          // Load the subgraph for shared nodes
          const res = await fetch(`${API_BASE}/graph/subgraph?ids=${nodeIds.join(',')}&depth=1`);
          const subgraph: { nodes: GraphNode[]; edges: GraphEdge[] } = await res.json();
          setNodes(subgraph.nodes || []);
          setEdges(subgraph.edges || []);
        }
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-cosmos-bg">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border border-stellar-blue/20 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-stellar-blue shadow-[0_0_16px_rgba(91,156,245,0.5)]" />
            </div>
          </div>
          <p className="text-cosmos-dim text-sm font-body">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-cosmos-bg">
        <div className="text-center glass-panel rounded-2xl p-8 max-w-sm">
          <div className="w-12 h-12 rounded-full border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">⚠</span>
          </div>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <a href="/" className="text-stellar-blue text-sm font-semibold hover:underline font-display">返回首页</a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-cosmos-bg">
      <header className="glass-panel shrink-0 z-30">
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(91,156,245,0.25), rgba(167,139,250,0.2))' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b9cf5" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4" />
            </svg>
          </div>
          <h1 className="text-base font-bold text-cosmos-text font-display tracking-tight">AI 知识图谱</h1>
          <span className="text-[10px] text-cosmos-dim font-display tracking-wider px-2 py-0.5 rounded border border-cosmos-border">只读视图</span>
        </div>
      </header>
      <div className="flex-1">
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          filterTypes={viewFilters}
          highlightNodeId={highlightId}
          onNodeClick={() => {}}
          onNodeDblClick={() => {}}
        />
      </div>
      <div className="absolute bottom-4 left-4 glass-panel rounded-lg px-3 py-1.5 text-[11px] text-cosmos-dim font-display tracking-wide pointer-events-none">
        <span className="text-cosmos-text font-semibold">{nodes.length}</span> 节点
        <span className="mx-1.5 opacity-30">·</span>
        <span className="text-cosmos-text font-semibold">{edges.length}</span> 关系
      </div>
    </div>
  );
}
