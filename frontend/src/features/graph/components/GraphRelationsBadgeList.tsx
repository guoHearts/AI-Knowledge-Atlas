'use client';

import type { RelationType } from '../types/graph.types';
import { RELATION_EXPLAINERS, RELATION_LABELS } from '../types/graph.types';

export function GraphRelationsBadgeList() {
  return (
    <div className="absolute right-4 top-4 hidden max-w-xs border border-cosmos-border bg-cosmos-surface/94 p-3 shadow-lg lg:block">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-cosmos-dim">Relations</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {Object.entries(RELATION_LABELS).slice(0, 6).map(([relation, label]) => (
          <span
            key={relation}
            title={RELATION_EXPLAINERS[relation as RelationType]}
            className="rounded-md border border-cosmos-border bg-cosmos-bg px-2 py-1 text-[10px] font-semibold text-cosmos-text"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
