'use client';

import Link from 'next/link';
import type { GraphEdge, GraphNode, NodeDetail, NodeType, RelationType } from '@/features/graph/types/graph.types';
import { NODE_COLORS, NODE_EXPLAINERS, NODE_LABELS, RELATION_EXPLAINERS, RELATION_LABELS } from '@/features/graph/types/graph.types';

interface Props {
  detail: NodeDetail | null;
  onClose: () => void;
  onFocusNode: (nodeType: string, nodeId: string) => void;
}

function findNeighbor(edge: GraphEdge, nodes: GraphNode[], direction: 'outgoing' | 'incoming') {
  const id = direction === 'outgoing' ? edge.target_id : edge.source_id;
  return nodes.find((node) => node.id === id);
}

function RelationRow({
  edge,
  neighbor,
  direction,
  onFocusNode,
}: {
  edge: GraphEdge;
  neighbor: GraphNode | undefined;
  direction: 'outgoing' | 'incoming';
  onFocusNode: (nodeType: string, nodeId: string) => void;
}) {
  const label = RELATION_LABELS[edge.relation as RelationType];
  const targetName = neighbor?.name || (direction === 'outgoing' ? edge.target_id : edge.source_id);

  return (
    <button
      onClick={() => neighbor && onFocusNode(neighbor.node_type, neighbor.id)}
      className="w-full border border-cosmos-border bg-cosmos-bg/60 px-3 py-2 text-left transition-all hover:border-cosmos-text hover:bg-cosmos-surface hover:shadow-[4px_4px_0_rgba(23,32,28,0.08)]"
    >
      <div className="flex items-center gap-2">
        <span className="border border-cosmos-border bg-cosmos-surface px-1.5 py-0.5 text-[10px] font-bold text-stellar-violet">
          {label}
        </span>
        <span className="text-xs font-bold text-cosmos-text">{targetName}</span>
      </div>
      <p className="mt-1 text-[11px] leading-4 text-cosmos-dim">
        {RELATION_EXPLAINERS[edge.relation as RelationType]}
      </p>
    </button>
  );
}

export function NodeDetailPanel({ detail, onClose, onFocusNode }: Props) {
  if (!detail?.node) {
    return (
      <div className="p-6 text-center text-sm text-cosmos-dim">
        点击图谱中的节点，查看它是什么、为什么重要、和哪些概念相连。
      </div>
    );
  }

  const { node, incoming, outgoing, neighbor_nodes } = detail;
  const nodeType = node.node_type as NodeType;
  const hasLearnLink = (node.metadata?.related_lessons as string[])?.length > 0;
  const readableSummary = node.summary_zh || node.description || '这个节点还缺少解释，建议在内容管道里补充来源和摘要。';

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-cosmos-border bg-cosmos-surface p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NODE_COLORS[nodeType] }} />
            <span className="border border-cosmos-border bg-cosmos-bg px-2 py-0.5 text-[10px] font-bold text-cosmos-dim">
              {NODE_LABELS[nodeType]}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭节点详情"
            className="grid h-8 w-8 place-items-center border border-cosmos-border text-lg leading-none text-cosmos-dim hover:border-cosmos-text hover:text-cosmos-text"
          >
            ×
          </button>
        </div>
        <h2 className="font-display text-3xl font-bold leading-tight text-cosmos-text">{node.name}</h2>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <section>
          <p className="border-l-4 border-stellar-blue bg-cosmos-bg px-3 py-2 text-xs font-semibold leading-5 text-cosmos-text">
            {NODE_EXPLAINERS[nodeType]}
          </p>
          <p className="mt-4 text-sm leading-7 text-cosmos-dim">{readableSummary}</p>
        </section>

        <section className="grid grid-cols-3 border border-cosmos-border bg-cosmos-surface">
          {[
            { label: '热度', value: Math.round(node.popularity) },
            { label: '连接到', value: outgoing.length },
            { label: '被连接', value: incoming.length },
          ].map((item, index) => (
            <div key={item.label} className={`p-3 ${index > 0 ? 'border-l border-cosmos-border' : ''}`}>
              <div className="font-display text-2xl font-bold text-cosmos-text">{item.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-cosmos-dim">{item.label}</div>
            </div>
          ))}
        </section>

        {hasLearnLink && (
          <Link
            href={`/learn/${(node.metadata?.related_lessons as string[])[0]}`}
            className="flex items-center justify-center border border-cosmos-text bg-cosmos-text px-4 py-2.5 text-sm font-bold text-cosmos-surface hover:bg-stellar-blue"
          >
            学习这个概念
          </Link>
        )}

        {outgoing.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-cosmos-dim">它连接到什么</h3>
            <div className="space-y-2">
              {outgoing.map((edge, index) => (
                <RelationRow
                  key={`${edge.source_id}-${edge.target_id}-${edge.relation}-${index}`}
                  edge={edge}
                  neighbor={findNeighbor(edge, neighbor_nodes, 'outgoing')}
                  direction="outgoing"
                  onFocusNode={onFocusNode}
                />
              ))}
            </div>
          </section>
        )}

        {incoming.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-cosmos-dim">谁连接到它</h3>
            <div className="space-y-2">
              {incoming.map((edge, index) => (
                <RelationRow
                  key={`${edge.source_id}-${edge.target_id}-${edge.relation}-${index}`}
                  edge={edge}
                  neighbor={findNeighbor(edge, neighbor_nodes, 'incoming')}
                  direction="incoming"
                  onFocusNode={onFocusNode}
                />
              ))}
            </div>
          </section>
        )}

        {node.source_urls?.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-cosmos-dim">来源</h3>
            <div className="space-y-1">
              {node.source_urls.map((url, index) => (
                <a
                  key={`${url}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-xs font-semibold text-stellar-blue hover:text-stellar-violet"
                >
                  {url}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
