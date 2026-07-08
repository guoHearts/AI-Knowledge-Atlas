'use client';

import { useState } from 'react';

import { PUBLISH_QUEUE_ITEMS, type PublishItem } from '../utils/publishQueue';

export function PublishQueueView() {
  const [items] = useState<PublishItem[]>(PUBLISH_QUEUE_ITEMS);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-display text-2xl font-bold text-cosmos-text">Publish queue</h1>
          <p className="text-sm text-cosmos-dim">Review pending content and prepare approved items for release.</p>
        </div>
        {selected.size > 0 && (
          <button className="btn-primary">
            Publish selected ({selected.size})
          </button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-cosmos-border px-5 py-3">
          <h3 className="text-sm font-bold text-cosmos-text">Pending items</h3>
          <span className="text-xs text-cosmos-dim">{items.length} items</span>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b border-cosmos-border px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.01]"
          >
            <input
              type="checkbox"
              checked={selected.has(item.id)}
              onChange={() => toggleSelect(item.id)}
              className="accent-stellar-blue"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  item.type === 'lesson' ? 'bg-stellar-blue/10 text-stellar-blue'
                    : item.type === 'module' ? 'bg-stellar-violet/10 text-stellar-violet'
                      : 'bg-stellar-emerald/10 text-stellar-emerald'
                }`}>
                  {item.type}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  item.status === 'review' ? 'bg-amber-400/10 text-amber-400'
                    : item.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400'
                      : 'bg-cosmos-bg text-cosmos-dim'
                }`}>
                  {item.status}
                </span>
              </div>
              <span className="text-sm text-cosmos-text">{item.title}</span>
              <span className="ml-3 text-xs text-cosmos-dim">{item.changes}</span>
            </div>
            <div className="shrink-0 text-right text-xs text-cosmos-dim">
              <div>{item.author}</div>
              <div>{item.updatedAt}</div>
            </div>
            <button className="shrink-0 text-xs text-stellar-blue hover:text-stellar-violet">
              View diff
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
