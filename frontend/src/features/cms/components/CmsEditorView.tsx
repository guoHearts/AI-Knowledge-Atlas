'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_EDITOR_CONTENT } from '../utils/editorTemplate';

interface CmsEditorViewProps {
  slug: string;
}

export function CmsEditorView({ slug }: CmsEditorViewProps) {
  const [content, setContent] = useState(DEFAULT_EDITOR_CONTENT);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cosmos-text">Course editor</h1>
          <p className="mt-1 text-xs text-cosmos-dim">
            {slug ? `Editing: ${slug}` : 'New lesson'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPreview(!preview)} className="btn-ghost text-xs">
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            className={`btn-primary text-xs ${saved ? 'border-emerald-400/30 bg-emerald-400/20 text-emerald-400' : ''}`}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className={`${preview ? 'w-1/2' : 'w-full'} min-h-[600px]`}>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="h-full min-h-[600px] w-full resize-none rounded-xl border border-cosmos-border bg-cosmos-surface p-6 font-mono text-sm leading-relaxed text-cosmos-text focus:border-stellar-blue/40 focus:outline-none"
            spellCheck={false}
          />
        </div>

        {preview && (
          <div className="glass-card min-h-[600px] w-1/2 p-6">
            <div className="prose-cosmos">
              <div className="mb-3 text-xs text-cosmos-dim">Preview</div>
              {content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) return <h1 key={index} className="mb-2 mt-4 text-2xl font-bold text-cosmos-text">{line.slice(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={index} className="mb-2 mt-4 text-xl font-semibold text-cosmos-text">{line.slice(3)}</h2>;
                if (line.startsWith('> ')) return <blockquote key={index} className="my-2 border-l-2 border-stellar-violet py-1 pl-4 text-sm italic text-cosmos-dim">{line.slice(2)}</blockquote>;
                if (line.startsWith('```')) return <div key={index} className="my-2 font-mono text-xs text-stellar-blue">{line}</div>;
                if (line.trim() === '---') return <hr key={index} className="my-4 border-cosmos-border" />;
                if (line.trim() === '') return <div key={index} className="h-3" />;
                return <p key={index} className="my-1 text-sm text-cosmos-dim">{line}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
