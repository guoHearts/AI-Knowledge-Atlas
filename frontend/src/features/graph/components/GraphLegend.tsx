'use client';

import type { GraphEdge, GraphNode, NodeType } from '../types/graph.types';
import { NODE_COLORS, NODE_LABELS } from '../types/graph.types';

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

interface GraphLegendProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function GraphLegend({ nodes, edges }: GraphLegendProps) {
  const counts = NODE_TYPE_ORDER.map((type) => ({
    type,
    count: nodes.filter((node) => node.node_type === type).length,
  }));

  return (
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
  );
}
