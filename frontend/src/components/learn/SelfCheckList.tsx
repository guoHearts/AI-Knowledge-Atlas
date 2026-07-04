'use client';

import { useState } from 'react';

const DEFAULT_CHECK_ITEMS = [
  '我能用生活类比向别人解释本课时的核心概念',
  '我能独立完成实验中的所有任务',
  '我能说出本课时技术点背后的设计思维',
  '我的代码能正常运行',
];

export function SelfCheckList({ lessonId }: { lessonId: string }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="glass-card p-5 my-6">
      <h3 className="text-sm font-bold text-cosmos-text mb-3">✅ 自检清单</h3>
      <div className="space-y-2">
        {DEFAULT_CHECK_ITEMS.map((item, i) => (
          <label key={i} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked.has(i)}
              onChange={() => toggle(i)}
              className="accent-emerald-400"
            />
            <span className={`text-xs transition-colors ${checked.has(i) ? 'text-cosmos-dim line-through' : 'text-cosmos-text group-hover:text-stellar-blue'}`}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
