'use client';

import { useState } from 'react';
import { MOCK_ITEMS, type PublishItem } from '@/features/cms/data/publishQueue';

export default function PublishPage() {
  const [items] = useState<PublishItem[]>(MOCK_ITEMS);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cosmos-text font-display mb-1">发布管理</h1>
          <p className="text-sm text-cosmos-dim">审核待发布内容、对比变更、一键发布</p>
        </div>
        {selected.size > 0 && (
          <button className="btn-primary">
            🚀 发布选中 ({selected.size})
          </button>
        )}
      </div>

      {/* Publish Queue */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-cosmos-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-cosmos-text">待发布队列</h3>
          <span className="text-xs text-cosmos-dim">{items.length} 项</span>
        </div>

        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-5 py-4 border-b border-cosmos-border last:border-b-0 hover:bg-white/[0.01] transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.has(item.id)}
              onChange={() => toggleSelect(item.id)}
              className="accent-stellar-blue"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  item.type === 'lesson' ? 'bg-stellar-blue/10 text-stellar-blue' :
                  item.type === 'module' ? 'bg-stellar-violet/10 text-stellar-violet' :
                  'bg-stellar-emerald/10 text-stellar-emerald'
                }`}>
                  {item.type === 'lesson' ? '课时' : item.type === 'module' ? '模块' : '路线'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  item.status === 'review' ? 'bg-amber-400/10 text-amber-400' :
                  item.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400' :
                  'bg-cosmos-bg text-cosmos-dim'
                }`}>
                  {item.status === 'review' ? '待审核' : item.status === 'approved' ? '已批准' : '草稿'}
                </span>
              </div>
              <span className="text-sm text-cosmos-text">{item.title}</span>
              <span className="text-xs text-cosmos-dim ml-3">{item.changes}</span>
            </div>
            <div className="text-right text-xs text-cosmos-dim shrink-0">
              <div>{item.author}</div>
              <div>{item.updatedAt}</div>
            </div>
            <button className="text-xs text-stellar-blue hover:text-stellar-violet shrink-0">
              查看变更
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
