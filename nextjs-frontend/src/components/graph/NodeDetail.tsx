'use client';

import Link from 'next/link';
import type { NodeDetail, NodeType } from '@/types/graph';
import { NODE_COLORS, NODE_LABELS, RELATION_LABELS, RelationType } from '@/types/graph';

interface Props {
  detail: NodeDetail | null;
  onClose: () => void;
  onFocusNode: (nodeType: string, nodeId: string) => void;
}

export function NodeDetailPanel({ detail, onClose, onFocusNode }: Props) {
  if (!detail?.node) {
    return (
      <div className="p-6 text-center text-cosmos-dim text-sm">
        点击图谱节点查看详情
      </div>
    );
  }

  const { node, incoming, outgoing, neighbor_nodes } = detail;
  const hasLearnLink = (node.metadata?.related_lessons as string[])?.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-cosmos-border">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: NODE_COLORS[node.node_type as NodeType] }}
          />
          <span className="text-[10px] text-cosmos-dim bg-cosmos-bg/50 px-2 py-0.5 rounded">
            {NODE_LABELS[node.node_type as NodeType]}
          </span>
        </div>
        <button onClick={onClose} className="text-cosmos-dim hover:text-cosmos-text text-lg leading-none">
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-cosmos-text">{node.name}</h2>
          {node.description && (
            <p className="text-sm text-cosmos-dim mt-2 leading-relaxed">{node.description}</p>
          )}
          {node.summary_zh && (
            <p className="text-sm text-cosmos-dim mt-1 italic">{node.summary_zh}</p>
          )}
        </div>

        {/* Learn link */}
        {hasLearnLink && (
          <Link
            href={`/learn/${(node.metadata?.related_lessons as string[])[0]}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stellar-blue/10 text-stellar-blue text-sm font-semibold hover:bg-stellar-blue/20 transition-colors"
          >
            📖 学习这个
          </Link>
        )}

        {/* Relations */}
        {outgoing.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-cosmos-dim mb-2">→ 发出关系</h4>
            <div className="space-y-1.5">
              {outgoing.map((edge, i) => {
                const target = neighbor_nodes.find(n => n.id === edge.target_id);
                return (
                  <button
                    key={i}
                    onClick={() => target && onFocusNode(target.node_type, target.id)}
                    className="flex items-center gap-2 w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="text-[10px] text-stellar-violet bg-stellar-violet/10 px-1.5 py-0.5 rounded">
                      {RELATION_LABELS[edge.relation as RelationType]}
                    </span>
                    <span className="text-cosmos-text">
                      {target?.name || edge.target_id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {incoming.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-cosmos-dim mb-2">← 进入关系</h4>
            <div className="space-y-1.5">
              {incoming.map((edge, i) => {
                const source = neighbor_nodes.find(n => n.id === edge.source_id);
                return (
                  <button
                    key={i}
                    onClick={() => source && onFocusNode(source.node_type, source.id)}
                    className="flex items-center gap-2 w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="text-[10px] text-stellar-violet bg-stellar-violet/10 px-1.5 py-0.5 rounded">
                      {RELATION_LABELS[edge.relation as RelationType]}
                    </span>
                    <span className="text-cosmos-text">
                      {source?.name || edge.source_id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Source URLs */}
        {node.source_urls?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-cosmos-dim mb-2">📎 来源</h4>
            <div className="space-y-1">
              {node.source_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-stellar-blue hover:text-stellar-violet truncate"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
