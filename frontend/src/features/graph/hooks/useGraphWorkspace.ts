'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getGraphNodeDetail,
  getGraphSubgraph,
  listGraphEdges,
  listGraphNodes,
  searchGraphNodes,
} from '../api/graphApi';
import type { GraphEdge, GraphNode, NodeDetail, NodeType } from '../types/graph.types';

export function useGraphWorkspace(focusId: string | null) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(focusId);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(focusId);
  const [filterTypes, setFilterTypes] = useState<NodeType[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listGraphNodes({ limit: 500 }),
      listGraphEdges(2000),
    ])
      .then(([fetchedNodes, fetchedEdges]) => {
        if (cancelled) return;
        setNodes(fetchedNodes);
        setEdges(fetchedEdges);
      })
      .catch((err: unknown) => {
        console.error('Failed to load graph:', err);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleNodeClick = useCallback(async (_nodeType: string, nodeId: string) => {
    try {
      const detail = await getGraphNodeDetail(_nodeType, nodeId);
      setSelectedNode(detail);
      setHighlightNodeId(nodeId);
      setPanelOpen(true);
    } catch (err) {
      console.error('Failed to fetch node:', err);
    }
  }, []);

  useEffect(() => {
    if (!focusId) return;

    const timer = window.setTimeout(() => {
      void handleNodeClick('Technology', focusId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [focusId, handleNodeClick]);

  const handleNodeDblClick = useCallback(async (nodeType: string, nodeId: string) => {
    try {
      const subgraph = await getGraphSubgraph([nodeId], 1);
      setNodes((prev) => {
        const existingIds = new Set(prev.map((node) => node.id));
        const newNodes = subgraph.nodes.filter((node) => !existingIds.has(node.id));
        return [...prev, ...newNodes];
      });
      setEdges((prev) => {
        const existingKeys = new Set(
          prev.map((edge) => `${edge.source_id}|${edge.target_id}|${edge.relation}`),
        );
        const newEdges = subgraph.edges.filter(
          (edge) => !existingKeys.has(`${edge.source_id}|${edge.target_id}|${edge.relation}`),
        );
        return [...prev, ...newEdges];
      });
      await handleNodeClick(nodeType, nodeId);
    } catch (err) {
      console.error('Failed to expand:', err);
    }
  }, [handleNodeClick]);

  const handleSearch = useCallback((query: string) => {
    return searchGraphNodes(query);
  }, []);

  const handleSearchSelect = useCallback((node: GraphNode) => {
    void handleNodeClick(node.node_type, node.id);
    setHighlightNodeId(node.id);
    setFocusNodeId(node.id);
  }, [handleNodeClick]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setHighlightNodeId(null);
  }, []);

  const toggleFilter = useCallback((type: NodeType) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
    );
  }, []);

  return {
    nodes,
    edges,
    loading,
    selectedNode,
    panelOpen,
    highlightNodeId,
    focusNodeId,
    filterTypes,
    handleNodeClick,
    handleNodeDblClick,
    handleSearch,
    handleSearchSelect,
    handleCanvasNodeClick: (node: GraphNode) => {
      void handleNodeClick(node.node_type, node.id);
    },
    handleCanvasNodeDblClick: (node: GraphNode) => {
      void handleNodeDblClick(node.node_type, node.id);
    },
    handleFocusDone: () => setFocusNodeId(null),
    closePanel,
    toggleFilter,
    clearFilter: () => setFilterTypes([]),
    selectAllFilters: () => setFilterTypes([]),
    reopenPanel: () => setPanelOpen(true),
  };
}
