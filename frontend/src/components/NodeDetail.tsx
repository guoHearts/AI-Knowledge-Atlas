import type { NodeDetail as NodeDetailType, RelationType } from '../types/graph';
import { NODE_COLORS, NODE_LABELS, NODE_ICONS, RELATION_LABELS } from '../types/graph';

interface Props {
  detail: NodeDetailType | null;
  onClose: () => void;
  onFocusNode: (nodeType: string, nodeId: string) => void;
  onExplore: (nodeId: string) => void;
}

export default function NodeDetailPanel({ detail, onClose, onFocusNode, onExplore }: Props) {
  if (!detail || !detail.node) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-cosmos-muted px-6 text-center">
        <div className="w-16 h-16 rounded-full border border-cosmos-border flex items-center justify-center mb-4 opacity-40">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </div>
        <p className="text-sm leading-relaxed">选择图谱中的节点<br/>查看详情与关联关系</p>
      </div>
    );
  }

  const { node, incoming, outgoing, neighbor_nodes } = detail;
  const color = NODE_COLORS[node.node_type];
  const icon = NODE_ICONS[node.node_type];

  return (
    <div className="h-full overflow-y-auto animate-fade-up">
      {/* Header — gradient accent bar at top */}
      <div className="relative">
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase"
              style={{
                background: `${color}18`,
                color: color,
                border: `1px solid ${color}30`,
              }}
            >
              <span className="text-sm">{icon}</span>
              {NODE_LABELS[node.node_type]}
            </span>
            <button
              onClick={onClose}
              className="text-cosmos-muted hover:text-cosmos-text transition-colors p-1 rounded hover:bg-white/5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className="text-xl font-bold text-cosmos-text font-display tracking-tight">
            {node.name}
          </h2>

          {node.first_seen && (
            <p className="text-xs text-cosmos-dim mt-2 font-body">
              <span className="opacity-50">首次收录</span>{' '}
              {new Date(node.first_seen).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {/* Summary — luminous accent */}
      {node.summary_zh && (
        <div className="mx-5 mb-4 px-4 py-3 rounded-lg"
          style={{
            background: `${color}0d`,
            border: `1px solid ${color}18`,
          }}>
          <p className="text-sm text-cosmos-text leading-relaxed">{node.summary_zh}</p>
        </div>
      )}

      {/* Popularity bar */}
      <div className="mx-5 mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] uppercase tracking-widest text-cosmos-dim font-display">热度指数</span>
          <span className="text-xs font-semibold text-cosmos-text font-display">{Math.round(node.popularity)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${node.popularity}%`,
              background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            }}
          />
        </div>
      </div>

      {/* Relations */}
      {(outgoing.length > 0 || incoming.length > 0) && (
        <div className="mx-5 mb-4">
          <h3 className="text-[11px] uppercase tracking-widest text-cosmos-dim font-display mb-3">
            关联图谱
          </h3>
          <div className="space-y-2">
            {outgoing.map((e, i) => (
              <RelationRow
                key={`out-${i}`}
                direction="out"
                label={RELATION_LABELS[e.relation as RelationType] || e.relation}
                targetId={e.target_id}
                neighborNodes={neighbor_nodes}
                onFocusNode={onFocusNode}
              />
            ))}
            {incoming.map((e, i) => (
              <RelationRow
                key={`in-${i}`}
                direction="in"
                label={RELATION_LABELS[e.relation as RelationType] || e.relation}
                targetId={e.source_id}
                neighborNodes={neighbor_nodes}
                onFocusNode={onFocusNode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Source links */}
      {node.source_urls.length > 0 && (
        <div className="mx-5 mb-4">
          <h3 className="text-[11px] uppercase tracking-widest text-cosmos-dim font-display mb-2">来源链接</h3>
          <div className="space-y-1">
            {node.source_urls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-stellar-blue/80 hover:text-stellar-blue truncate transition-colors py-1"
              >
                {url}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-5 pt-2">
        <button
          onClick={() => onExplore(node.id)}
          className="w-full py-2.5 rounded-lg text-sm font-semibold font-body transition-all duration-200"
          style={{
            background: `${color}20`,
            color: color,
            border: `1px solid ${color}30`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${color}30`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `${color}20`;
          }}
        >
          探索完整知识链
        </button>
      </div>
    </div>
  );
}

/* ─── Relation Row ─────────────────────────────── */
function RelationRow({
  direction,
  label,
  targetId,
  neighborNodes,
  onFocusNode,
}: {
  direction: 'in' | 'out';
  label: string;
  targetId: string;
  neighborNodes: NodeDetailType['neighbor_nodes'];
  onFocusNode: (nodeType: string, nodeId: string) => void;
}) {
  const neighbor = neighborNodes.find(n => n.id === targetId);
  const neighborColor = neighbor ? NODE_COLORS[neighbor.node_type] : undefined;
  const neighborLabel = neighbor ? NODE_LABELS[neighbor.node_type] : '';

  return (
    <div className="flex items-center gap-2 text-sm group">
      {direction === 'in' && (
        <button
          onClick={() => neighbor && onFocusNode(neighbor.node_type, neighbor.id)}
          className="text-cosmos-text/80 hover:text-stellar-blue transition-colors truncate max-w-[120px] text-left font-medium"
        >
          {targetId}
        </button>
      )}
      <span className="text-[11px] px-1.5 py-0.5 rounded text-cosmos-dim bg-white/5 font-body shrink-0">
        {label}
      </span>
      {direction === 'out' && (
        <button
          onClick={() => neighbor && onFocusNode(neighbor.node_type, neighbor.id)}
          className="text-cosmos-text/80 hover:text-stellar-blue transition-colors truncate max-w-[120px] text-left font-medium"
        >
          {targetId}
        </button>
      )}
      {neighbor && (
        <span
          className="text-[10px] px-1 rounded shrink-0 ml-auto opacity-60"
          style={{ color: neighborColor, background: `${neighborColor}15` }}
        >
          {neighborLabel}
        </span>
      )}
    </div>
  );
}
