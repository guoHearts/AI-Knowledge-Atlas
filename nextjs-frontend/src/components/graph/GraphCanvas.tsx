'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge, NodeType } from '@/types/graph';
import { NODE_COLORS, NODE_GLOWS, NODE_LABELS } from '@/types/graph';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  filterTypes: NodeType[];
  highlightNodeId: string | null;
  focusNodeId: string | null;
  onFocusDone: () => void;
  onNodeClick: (node: GraphNode) => void;
  onNodeDblClick: (node: GraphNode) => void;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  node_type: NodeType;
  popularity: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  relation: string;
}

export function GraphCanvas({
  nodes: rawNodes, edges: rawEdges, filterTypes, highlightNodeId,
  focusNodeId, onFocusDone, onNodeClick, onNodeDblClick,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  const filteredNodes = filterTypes.length > 0
    ? rawNodes.filter(n => filterTypes.includes(n.node_type))
    : rawNodes;

  const nodeIdSet = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = rawEdges.filter(
    e => nodeIdSet.has(e.source_id) && nodeIdSet.has(e.target_id)
  );

  const simNodes: SimNode[] = filteredNodes.map(n => ({
    id: n.id,
    name: n.name,
    node_type: n.node_type,
    popularity: n.popularity,
    x: undefined,
    y: undefined,
  }));

  const nodeMap = new Map(simNodes.map(n => [n.id, n]));
  const simLinks: SimLink[] = filteredEdges
    .filter(e => nodeMap.has(e.source_id) && nodeMap.has(e.target_id))
    .map(e => ({
      source: e.source_id,
      target: e.target_id,
      relation: e.relation,
    }));

  useEffect(() => {
    if (!svgRef.current || simNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    // Defs for glow filters
    const defs = svg.append('defs');
    Object.entries(NODE_GLOWS).forEach(([type, color]) => {
      const filter = defs.append('filter').attr('id', `glow-${type}`);
      filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
      const merge = filter.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    });

    // Container with zoom
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => { g.attr('transform', event.transform.toString()); });
    svg.call(zoom);

    // Focus on node
    if (focusNodeId) {
      const focusNode = simNodes.find(n => n.id === focusNodeId);
      if (focusNode?.x && focusNode?.y) {
        svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2 - focusNode.x, height / 2 - focusNode.y).scale(1.5));
      }
      setTimeout(onFocusDone, 500);
    }

    // Links
    const link = g.append('g').selectAll<SVGLineElement, SimLink>('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.06)')
      .attr('stroke-width', 0.5);

    // Nodes
    const node = g.append('g').selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .attr('cursor', 'pointer');

    // Glow circle
    node.append('circle')
      .attr('r', d => 5 + Math.sqrt(d.popularity) * 1.5)
      .attr('fill', d => NODE_GLOWS[d.node_type] || '#94a3b8')
      .attr('opacity', 0.15)
      .attr('filter', d => `url(#glow-${d.node_type})`);

    // Main circle
    node.append('circle')
      .attr('r', d => 3 + Math.sqrt(d.popularity) * 1.2)
      .attr('fill', d => NODE_COLORS[d.node_type] || '#94a3b8')
      .attr('stroke', d => NODE_COLORS[d.node_type] || '#94a3b8')
      .attr('stroke-width', 0.5)
      .attr('opacity', d => highlightNodeId ? (d.id === highlightNodeId ? 1 : 0.3) : 0.85);

    // Label
    node.append('text')
      .text(d => d.name.length > 12 ? d.name.slice(0, 10) + '…' : d.name)
      .attr('x', 8)
      .attr('y', 3)
      .attr('fill', '#94a3b8')
      .attr('font-size', '8px')
      .attr('font-family', 'system-ui')
      .attr('opacity', d => highlightNodeId ? (d.id === highlightNodeId ? 1 : 0.2) : 0.7);

    // Interactions
    node.on('click', (_event, d) => onNodeClick(rawNodes.find(n => n.id === d.id)!))
      .on('dblclick', (_event, d) => onNodeDblClick(rawNodes.find(n => n.id === d.id)!));

    // Drag
    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x; d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      });
    node.call(drag as any);

    // Simulation
    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id(d => d.id).distance(60))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(12))
      .on('tick', () => {
        link
          .attr('x1', d => (d.source as SimNode).x!)
          .attr('y1', d => (d.source as SimNode).y!)
          .attr('x2', d => (d.target as SimNode).x!)
          .attr('y2', d => (d.target as SimNode).y!);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [simNodes.length, simLinks.length, highlightNodeId, focusNodeId]);

  return (
    <svg ref={svgRef} className="w-full h-full" style={{ background: 'radial-gradient(ellipse at center, #111827 0%, #0a0e17 70%)' }} />
  );
}
