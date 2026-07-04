'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

export default function EditorPage() {
  const params = useParams();
  const slug = (params?.slug as string[])?.join('/') || '';
  const [content, setContent] = useState(`---
title: 课时标题
difficulty: beginner
estimatedMinutes: 45
analogy: 一个生活类比
oneLiner: 一句话理解
tags: [标签1, 标签2]
---

# 课时标题

> 💡 核心概念的一句话理解

## 为什么需要这个？

内容正文...

## 动手实验

\`\`\`typescript
// 代码模板
\`\`\`
`);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    // In real app: save to file system
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cosmos-text font-display">课程编辑器</h1>
          <p className="text-xs text-cosmos-dim mt-1">
            {slug ? `编辑: ${slug}` : '新建课时'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreview(!preview)}
            className="btn-ghost text-xs"
          >
            {preview ? '编辑' : '预览'}
          </button>
          <button
            onClick={handleSave}
            className={`btn-primary text-xs ${saved ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30' : ''}`}
          >
            {saved ? '✓ 已保存' : '保存'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Editor */}
        <div className={`${preview ? 'w-1/2' : 'w-full'} min-h-[600px]`}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[600px] bg-cosmos-surface border border-cosmos-border rounded-xl p-6 text-sm font-mono text-cosmos-text resize-none focus:outline-none focus:border-stellar-blue/40 leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="w-1/2 min-h-[600px] glass-card p-6">
            <div className="prose-cosmos">
              <div className="text-xs text-cosmos-dim mb-3">预览模式</div>
              {/* Simple preview */}
              {content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-cosmos-text mt-4 mb-2">{line.slice(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold text-cosmos-text mt-4 mb-2">{line.slice(3)}</h2>;
                if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 border-stellar-violet pl-4 py-1 my-2 text-sm text-cosmos-dim italic">{line.slice(2)}</blockquote>;
                if (line.startsWith('```')) return <div key={i} className="my-2 text-xs text-stellar-blue font-mono">{line}</div>;
                if (line.trim() === '---') return <hr key={i} className="my-4 border-cosmos-border" />;
                if (line.trim() === '') return <div key={i} className="h-3" />;
                return <p key={i} className="text-sm text-cosmos-dim my-1">{line}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
