'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getGraphNodeDetail, getGraphSubgraph } from '@/features/graph/api/graphApi';
import type { GraphNode, GraphEdge, NodeType } from '@/features/graph/types/graph.types';
import { NODE_COLORS } from '@/features/graph/types/graph.types';

interface Props {
  nodeIds: string[];
}

export function MiniGraph({ nodeIds }: Props) {
  const t = useTranslations('graph');
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        // Try fetching subgraph first
        const subgraph = await getGraphSubgraph(nodeIds, 1);
        if (!cancelled) {
          const uniqueNodes = dedupeById(subgraph.nodes);
          const uniqueEdges = dedupeEdges(subgraph.edges);
          setNodes(uniqueNodes);
          setLinks(uniqueEdges);
        }
      } catch {
        // Fallback: try fetching individual node details
        try {
          const nodePromises = nodeIds.map(id => {
            // Guess the type from common mappings
            return getGraphNodeDetail('Technology', id).catch(() => null);
          });
          const details = await Promise.all(nodePromises);
          if (!cancelled) {
            const fallbackNodes: GraphNode[] = [];
            for (const d of details) {
              if (d?.node) fallbackNodes.push(d.node);
            }
            setNodes(dedupeById(fallbackNodes));
            setLinks([]);
          }
        } catch (fallbackErr) {
          if (!cancelled) setError(t('miniGraphLoadFailed'));
        }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [nodeIds, t]);

  // Simple D3-like force layout (no D3 dependency for mini graph)
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = svgRef.current;
    const width = 200;
    const height = 150;
    const padding = 30;

    // Simple circular layout for mini graph
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - padding - 10;

    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      (node as any)._x = cx + radius * Math.cos(angle);
      (node as any)._y = cy + radius * Math.sin(angle);
    });

    // Force update SVG
    svg.innerHTML = '';

    links.forEach((edge) => {
      const src = nodes.find(n => n.id === edge.source_id);
      const tgt = nodes.find(n => n.id === edge.target_id);
      if (src && tgt) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String((src as any)._x));
        line.setAttribute('y1', String((src as any)._y));
        line.setAttribute('x2', String((tgt as any)._x));
        line.setAttribute('y2', String((tgt as any)._y));
        line.setAttribute('stroke', 'rgba(255,255,255,0.08)');
        line.setAttribute('stroke-width', '0.5');
        svg.appendChild(line);
      }
    });

    nodes.forEach((node) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String((node as any)._x));
      circle.setAttribute('cy', String((node as any)._y));
      circle.setAttribute('r', '6');
      circle.setAttribute('fill', NODE_COLORS[node.node_type as NodeType] || 'var(--cosmos-dim)');
      circle.setAttribute('opacity', '0.8');
      circle.style.cursor = 'pointer';
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String((node as any)._x));
      text.setAttribute('y', String((node as any)._y + 16));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'var(--cosmos-dim)');
      text.setAttribute('font-size', '8');
      text.setAttribute('font-family', 'system-ui');
      text.textContent = node.name.length > 10 ? node.name.slice(0, 8) + '..' : node.name;
      g.appendChild(text);

      g.addEventListener('click', () => {
        window.open(`/graph?focus=${node.id}`, '_blank');
      });

      svg.appendChild(g);
    });
  }, [nodes, links]);

  if (loading) {
    return <div className="flex items-center justify-center h-[150px] text-xs text-cosmos-dim">{t('loadingGraph')}</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-[150px] text-xs text-cosmos-dim">{error}</div>;
  }
  if (nodes.length === 0) {
    return <div className="flex items-center justify-center h-[150px] text-xs text-cosmos-dim">{t('miniGraphEmpty')}</div>;
  }

  return (
    <div>
      <svg ref={svgRef} width="200" height="150" className="mx-auto" />
      <div className="mt-2 space-y-1">
        {nodes.slice(0, 5).map(node => (
          <Link
            key={node.id}
            href={`/graph?focus=${node.id}`}
            target="_blank"
            className="flex items-center gap-2 text-[10px] text-cosmos-dim hover:text-stellar-blue transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: NODE_COLORS[node.node_type as NodeType] }}
            />
            {node.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function dedupeById(items: GraphNode[]): GraphNode[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function dedupeEdges(items: GraphEdge[]): GraphEdge[] {
  const seen = new Set<string>();
  return items.filter(e => {
    const key = `${e.source_id}|${e.target_id}|${e.relation}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
