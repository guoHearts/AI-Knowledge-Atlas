import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge, NodeType } from '../types/graph';
import { NODE_COLORS } from '../types/graph';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
  onNodeDblClick: (node: GraphNode) => void;
  filterTypes: NodeType[];
  highlightNodeId: string | null;
  focusNodeId?: string | null;
  onFocusDone?: () => void;
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

// Node size: scale popularity to radius (14–40px)
function nodeRadius(popularity: number): number {
  return 14 + (popularity / 100) * 26;
}

export default function GraphCanvas({
  nodes, edges, onNodeClick, onNodeDblClick, filterTypes, highlightNodeId,
  focusNodeId, onFocusDone,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const focusNodeIdRef = useRef<string | null | undefined>(null);

  const draw = useCallback(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const svg = d3.select(svgElement);
    const width = svgElement.clientWidth || 900;
    const height = svgElement.clientHeight || 600;
    svg.selectAll('*').remove();

    // Filter nodes
    const filteredNodes = filterTypes.length > 0
      ? nodes.filter(n => filterTypes.includes(n.node_type))
      : nodes;

    if (filteredNodes.length === 0) {
      // Empty state
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#5c6a85')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 16)
        .text('暂无数据 · 等待数据同步');
      return;
    }

    // Build lookup
    const nodeMap = new Map(filteredNodes.map(n => [n.id, n]));
    const filteredEdges = edges.filter(
      e => nodeMap.has(e.source_id) && nodeMap.has(e.target_id)
    );

    // Transform to simulation format
    const simNodes: SimNode[] = filteredNodes.map(n => ({
      id: n.id,
      name: n.name,
      node_type: n.node_type,
      popularity: n.popularity,
      x: width / 2 + (Math.random() - 0.5) * 300,
      y: height / 2 + (Math.random() - 0.5) * 300,
    }));

    const nodeById = new Map(simNodes.map(n => [n.id, n]));
    const simLinks: SimLink[] = filteredEdges.map(e => ({
      source: nodeById.get(e.source_id)!,
      target: nodeById.get(e.target_id)!,
      relation: e.relation,
    })).filter(l => l.source && l.target);

    // ─── Container group with zoom ───────────────────────
    const g = svg.append('g');
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoomBehavior);

    // ─── Background star field (subtle) ──────────────────
    const starData = Array.from({ length: 60 }, () => ({
      x: Math.random() * width * 2 - width / 2,
      y: Math.random() * height * 2 - height / 2,
      r: Math.random() * 0.8 + 0.2,
    }));
    g.append('g').attr('id', 'stars')
      .selectAll('circle')
      .data(starData)
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .attr('fill', '#5c6a85')
      .attr('opacity', () => 0.25 + Math.random() * 0.4);

    // ─── Arrow marker defs ───────────────────────────────
    const defs = g.append('defs');

    defs.selectAll('marker')
      .data(['arrow'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 26)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(100,140,200,0.35)');

    // ─── Node glow filters ───────────────────────────────
    // Create a generic glow filter
    const filter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
    filter.append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .join('feMergeNode')
      .attr('in', d => d);

    // Stronger glow for highlighted node
    const hFilter = defs.append('filter')
      .attr('id', 'node-glow-highlight')
      .attr('x', '-80%').attr('y', '-80%')
      .attr('width', '260%').attr('height', '260%');
    hFilter.append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'blur');
    const hMerge = hFilter.append('feMerge');
    hMerge.append('feMergeNode').attr('in', 'blur');
    hMerge.append('feMergeNode').attr('in', 'blur'); // double glow
    hMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // ─── Links ───────────────────────────────────────────
    const linkGroup = g.append('g').attr('id', 'links');
    const link = linkGroup.selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', 'rgba(100,140,200,0.22)')
      .attr('stroke-width', d => Math.max(0.8, d.relation === 'COMPETES_WITH' ? 1.8 : 1))
      .attr('stroke-dasharray', d => d.relation === 'COMPETES_WITH' ? '6,3' : null)
      .attr('marker-end', 'url(#arrow)');

    // ─── Nodes ───────────────────────────────────────────
    const nodeGroup = g.append('g').attr('id', 'nodes');
    const nodeG = nodeGroup.selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .style('filter', d => d.id === highlightNodeId
        ? 'url(#node-glow-highlight)'
        : 'url(#node-glow)');

    // Main circle
    nodeG.append('circle')
      .attr('r', d => nodeRadius(d.popularity))
      .attr('fill', d => NODE_COLORS[d.node_type])
      .attr('fill-opacity', 0.85)
      .attr('stroke', d => d.id === highlightNodeId ? '#fbbf24' : 'rgba(255,255,255,0.25)')
      .attr('stroke-width', d => d.id === highlightNodeId ? 2.5 : 1);

    // Inner highlight ring
    nodeG.append('circle')
      .attr('r', d => nodeRadius(d.popularity) * 0.45)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.3)')
      .attr('stroke-width', 0.8);

    // Click & double-click
    nodeG.on('click', (_, d) => {
        const orig = nodeMap.get(d.id);
        if (orig) onNodeClick(orig);
      })
      .on('dblclick', (_, d) => {
        const orig = nodeMap.get(d.id);
        if (orig) onNodeDblClick(orig);
      });

    // Tooltip
    nodeG.append('title')
      .text(d => `${d.name}\n${d.node_type}`);

    // ─── Labels ──────────────────────────────────────────
    const labelGroup = g.append('g').attr('id', 'labels');
    labelGroup.selectAll<SVGTextElement, SimNode>('text')
      .data(simNodes)
      .join('text')
      .text(d => d.name)
      .attr('font-family', '"DM Sans", "Space Grotesk", sans-serif')
      .attr('font-size', d => 12 + (d.popularity / 100) * 4)
      .attr('font-weight', 600)
      .attr('fill', '#e8eaf0')
      .attr('dx', d => nodeRadius(d.popularity) + 6)
      .attr('dy', 5)
      .attr('text-anchor', 'start')
      .attr('paint-order', 'stroke')
      .attr('stroke', 'rgba(6,9,15,0.75)')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .style('pointer-events', 'none')
      .style('letter-spacing', '0.01em');

    // ─── Force simulation ────────────────────────────────
    const simulation = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks)
        .distance(d => 120 + (100 - (nodeMap.get((d.source as SimNode).id)?.popularity || 50)) * 0.5)
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius(d => nodeRadius(d.popularity) + 8))
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02));

    simulation.alphaDecay(0.02);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimNode).x!)
        .attr('y1', d => (d.source as SimNode).y!)
        .attr('x2', d => (d.target as SimNode).x!)
        .attr('y2', d => (d.target as SimNode).y!);
      nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
      labelGroup.selectAll<SVGTextElement, SimNode>('text')
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    simulation.on('end', () => {
      // ─── Initial zoom to fit ─────────────────────────────
      if (simNodes.length > 0) {
        const padding = 80;
        const xs = simNodes.map(d => d.x!);
        const ys = simNodes.map(d => d.y!);
        const xMin = Math.min(...xs);
        const xMax = Math.max(...xs);
        const yMin = Math.min(...ys);
        const yMax = Math.max(...ys);
        const boundsW = xMax - xMin || 200;
        const boundsH = yMax - yMin || 200;
        const scale = Math.min(
          (width - padding * 2) / boundsW,
          (height - padding * 2) / boundsH,
          1.2,
        );
        const cx = (xMin + xMax) / 2;
        const cy = (yMin + yMax) / 2;
        svg.transition().duration(600).call(
          zoomBehavior.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(scale)
            .translate(-cx, -cy),
        );
      }

      // ─── Focus on specific node (search result) ─────────
      const focusId = focusNodeIdRef.current;
      if (focusId) {
        const focusNode = simNodes.find(n => n.id === focusId);
        if (focusNode && focusNode.x != null && focusNode.y != null) {
          svg.transition().duration(500).call(
            zoomBehavior.transform,
            d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(1.5)
              .translate(-focusNode.x, -focusNode.y),
          );
        }
        focusNodeIdRef.current = null;
        onFocusDone?.();
      }
    });

    return () => { simulation.stop(); };
  }, [nodes, edges, filterTypes, highlightNodeId, onNodeClick, onNodeDblClick]);

  useEffect(() => { draw(); }, [draw]);

  // Sync focusNodeId to ref so draw() can read it without re-triggering
  useEffect(() => {
    focusNodeIdRef.current = focusNodeId;
  }, [focusNodeId]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #0f1a2e 0%, #06090f 70%)' }}
    />
  );
}
