'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge, NodeType } from '@/types/graph';
import { NODE_COLORS } from '@/types/graph';

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
  nodes: rawNodes,
  edges: rawEdges,
  filterTypes,
  highlightNodeId,
  focusNodeId,
  onFocusDone,
  onNodeClick,
  onNodeDblClick,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const filteredNodes = useMemo(() => (
    filterTypes.length > 0
      ? rawNodes.filter((node) => filterTypes.includes(node.node_type))
      : rawNodes
  ), [filterTypes, rawNodes]);

  const filteredEdges = useMemo(() => {
    const nodeIdSet = new Set(filteredNodes.map((node) => node.id));
    return rawEdges.filter(
      (edge) => nodeIdSet.has(edge.source_id) && nodeIdSet.has(edge.target_id)
    );
  }, [filteredNodes, rawEdges]);

  useEffect(() => {
    if (!svgRef.current || filteredNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    const simNodes: SimNode[] = filteredNodes.map((node) => ({
      id: node.id,
      name: node.name,
      node_type: node.node_type,
      popularity: node.popularity,
    }));

    const nodeMap = new Map(simNodes.map((node) => [node.id, node]));
    const simLinks: SimLink[] = filteredEdges
      .filter((edge) => nodeMap.has(edge.source_id) && nodeMap.has(edge.target_id))
      .map((edge) => ({
        source: edge.source_id,
        target: edge.target_id,
        relation: edge.relation,
      }));

    const defs = svg.append('defs');
    const pattern = defs
      .append('pattern')
      .attr('id', 'atlas-grid')
      .attr('width', 28)
      .attr('height', 28)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern
      .append('path')
      .attr('d', 'M 28 0 L 0 0 0 28')
      .attr('fill', 'none')
      .attr('stroke', 'var(--cosmos-border)')
      .attr('stroke-width', 1);

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#atlas-grid)');

    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });
    svg.call(zoom);

    const link = g.append('g').selectAll<SVGLineElement, SimLink>('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', 'var(--cosmos-border)')
      .attr('stroke-width', 1)
      .attr('stroke-linecap', 'round');

    const node = g.append('g').selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .attr('cursor', 'pointer');

    node
      .append('circle')
      .attr('r', (d) => 8 + Math.sqrt(d.popularity) * 1.2)
      .attr('fill', 'var(--cosmos-surface)')
      .attr('stroke', (d) => NODE_COLORS[d.node_type] || 'var(--cosmos-dim)')
      .attr('stroke-width', (d) => d.id === highlightNodeId ? 4 : 2)
      .attr('opacity', (d) => highlightNodeId ? (d.id === highlightNodeId ? 1 : 0.42) : 0.95);

    node
      .append('circle')
      .attr('r', (d) => 3.5 + Math.sqrt(d.popularity) * 0.45)
      .attr('fill', (d) => NODE_COLORS[d.node_type] || 'var(--cosmos-dim)')
      .attr('opacity', (d) => highlightNodeId ? (d.id === highlightNodeId ? 1 : 0.55) : 0.9);

    node
      .append('text')
      .text((d) => d.name.length > 14 ? `${d.name.slice(0, 12)}...` : d.name)
      .attr('x', 15)
      .attr('y', 4)
      .attr('fill', 'var(--cosmos-text)')
      .attr('font-size', '10px')
      .attr('font-weight', 700)
      .attr('font-family', 'ui-sans-serif, system-ui, sans-serif')
      .attr('paint-order', 'stroke')
      .attr('stroke', 'var(--cosmos-surface)')
      .attr('stroke-width', 4)
      .attr('opacity', (d) => highlightNodeId ? (d.id === highlightNodeId ? 1 : 0.35) : 0.82);

    node
      .on('click', (_event, d) => {
        const original = rawNodes.find((nodeItem) => nodeItem.id === d.id);
        if (original) onNodeClick(original);
      })
      .on('dblclick', (_event, d) => {
        const original = rawNodes.find((nodeItem) => nodeItem.id === d.id);
        if (original) onNodeDblClick(original);
      });

    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(82))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(24))
      .on('tick', () => {
        link
          .attr('x1', (d) => (d.source as SimNode).x!)
          .attr('y1', (d) => (d.source as SimNode).y!)
          .attr('x2', (d) => (d.target as SimNode).x!)
          .attr('y2', (d) => (d.target as SimNode).y!);
        node.attr('transform', (d) => `translate(${d.x},${d.y})`);
      });

    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.25).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    if (focusNodeId) {
      setTimeout(() => {
        const focusNode = simNodes.find((nodeItem) => nodeItem.id === focusNodeId);
        if (focusNode?.x && focusNode?.y) {
          svg.call(
            zoom.transform,
            d3.zoomIdentity.translate(width / 2 - focusNode.x * 1.35, height / 2 - focusNode.y * 1.35).scale(1.35)
          );
        }
        onFocusDone();
      }, 600);
    }

    return () => {
      simulation.stop();
    };
  }, [
    filteredNodes,
    filteredEdges,
    highlightNodeId,
    focusNodeId,
    onFocusDone,
    onNodeClick,
    onNodeDblClick,
    rawNodes,
  ]);

  return (
    <svg
      ref={svgRef}
      className="h-full w-full"
      className="h-full w-full" style={{ background: 'linear-gradient(135deg, var(--cosmos-bg) 0%, var(--cosmos-bg) 100%)' }}
    />
  );
}
