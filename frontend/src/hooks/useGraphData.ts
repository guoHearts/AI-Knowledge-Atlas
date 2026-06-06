import { useState, useEffect, useCallback } from 'react';
import type { GraphNode, GraphEdge, NodeDetail } from '../types/graph';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useGraphData() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [nodesRes, edgesRes] = await Promise.all([
        fetch(`${API_BASE}/graph/nodes?limit=500`),
        fetch(`${API_BASE}/graph/edges?limit=2000`),
      ]);
      setNodes(await nodesRes.json());
      setEdges(await edgesRes.json());
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    }
    setLoading(false);
  }, []);

  const selectNode = useCallback(async (nodeType: string, nodeId: string) => {
    try {
      const res = await fetch(`${API_BASE}/graph/nodes/${nodeType}/${nodeId}`);
      const detail: NodeDetail = await res.json();
      setSelectedNode(detail);
    } catch (err) {
      console.error('Failed to fetch node detail:', err);
    }
  }, []);

  const search = useCallback(async (query: string): Promise<GraphNode[]> => {
    try {
      const res = await fetch(`${API_BASE}/graph/nodes/search?q=${encodeURIComponent(query)}`);
      return (await res.json()) as GraphNode[];
    } catch (err) {
      console.error('Search failed:', err);
      return [];
    }
  }, []);

  const expandNode = useCallback(async (nodeId: string) => {
    try {
      const res = await fetch(`${API_BASE}/graph/subgraph?ids=${encodeURIComponent(nodeId)}&depth=1`);
      const subgraph: { nodes: GraphNode[]; edges: GraphEdge[] } = await res.json();
      setNodes(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNodes = subgraph.nodes.filter(n => !existingIds.has(n.id));
        return [...prev, ...newNodes];
      });
      setEdges(prev => {
        const existingKeys = new Set(prev.map(e => `${e.source_id}|${e.target_id}|${e.relation}`));
        const newEdges = subgraph.edges.filter(
          e => !existingKeys.has(`${e.source_id}|${e.target_id}|${e.relation}`)
        );
        return [...prev, ...newEdges];
      });
    } catch (err) {
      console.error('Expand node failed:', err);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { nodes, edges, loading, selectedNode, selectNode, search, expandNode, refetch: fetchAll };
}
