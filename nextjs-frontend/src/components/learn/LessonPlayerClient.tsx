'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DifficultyBadge } from '@/components/shared/DifficultyBadge';
import { AnalogyCard } from '@/components/shared/AnalogyCard';
import { ExperimentPanel } from '@/components/learn/ExperimentPanel';
import { MiniGraph } from '@/components/learn/MiniGraph';
import { DesignInsight } from '@/components/learn/DesignInsight';
import { EnterpriseScenario } from '@/components/learn/EnterpriseScenario';
import { SelfCheckList } from '@/components/learn/SelfCheckList';
import type {
  LearningTrack, Module, Lesson, UserProgress,
} from '@/types/learning';

interface Props {
  track: LearningTrack;
  module: Module;
  lesson: Lesson;
  progress?: UserProgress;
  mdxContent: string;
  navigation: {
    prev: { title: string; href: string } | null;
    next: { title: string; href: string } | null;
  };
}

export function LessonPlayerClient({
  track, module: mod, lesson, progress: initialProgress,
  mdxContent, navigation,
}: Props) {
  const experimentConfig = lesson.experimentConfig;
  const graphNodeIds = lesson.graphNodeIds;
  const router = useRouter();
  const [progressState, setProgressState] = useState<UserProgress | undefined>(initialProgress);
  const [showExperiment, setShowExperiment] = useState(false);

  const markComplete = useCallback(async () => {
    const res = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: lesson.id,
        status: 'completed',
      }),
    });
    if (res.ok) {
      setProgressState(prev => ({ ...(prev || {}), status: 'completed' } as UserProgress));
      router.refresh();
    }
  }, [lesson.id, router]);

  const markInProgress = useCallback(async () => {
    if (progressState?.status === 'not_started' || !progressState) {
      const res = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          status: 'in_progress',
        }),
      });
      if (res.ok) {
        setProgressState(prev => ({ ...(prev || {}), status: 'in_progress' } as UserProgress));
      }
    }
  }, [lesson.id, progressState]);

  const isCompleted = progressState?.status === 'completed';

  return (
    <div className="max-w-6xl mx-auto px-6 py-8" onClick={markInProgress}>
      {/* ─── Breadcrumb ────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs text-cosmos-dim mb-6 flex-wrap">
        <Link href="/" className="hover:text-stellar-blue">首页</Link>
        <span>/</span>
        <Link href={`/learn/${track.slug}`} className="hover:text-stellar-blue">{track.title}</Link>
        <span>/</span>
        <span className="text-cosmos-text">{mod.title}</span>
      </nav>

      <div className="flex gap-8">
        {/* ─── Main Content ────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Lesson Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <DifficultyBadge difficulty={lesson.difficulty as 'beginner' | 'intermediate' | 'advanced'} size="md" />
              <span className="text-xs text-cosmos-dim">⏱️ {lesson.estimatedMinutes} 分钟</span>
              {isCompleted && (
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">✓ 已完成</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-cosmos-text font-display">{lesson.title}</h1>

            {/* Analogy */}
            {lesson.analogy && lesson.oneLiner && (
              <AnalogyCard analogy={lesson.analogy} oneLiner={lesson.oneLiner} />
            )}
          </div>

          {/* MDX Content */}
          <div className="prose-cosmos mb-12">
            {/* Render MDX content with basic markdown parsing */}
            <MDXContent content={mdxContent} />
          </div>

          {/* Design Insight */}
          <DesignInsight lesson={lesson} />

          {/* Enterprise Scenario */}
          <EnterpriseScenario lesson={lesson} />

          {/* Self Check */}
          <SelfCheckList lessonId={lesson.id} />

          {/* Experiment Button */}
          {experimentConfig && (
            <motion.div
              className="mt-8 mb-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setShowExperiment(!showExperiment)}
                className="btn-primary text-base px-6 py-3"
              >
                {showExperiment ? '收起实验' : '🔬 开始动手实验'}
              </button>
            </motion.div>
          )}

          {/* Experiment Panel */}
          <AnimatePresence>
            {showExperiment && experimentConfig && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ExperimentPanel
                  config={experimentConfig}
                  lessonId={lesson.id}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Complete Button */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-cosmos-border">
            <button
              onClick={markComplete}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                isCompleted
                  ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                  : 'bg-stellar-blue/20 text-stellar-blue border border-stellar-blue/30 hover:bg-stellar-blue/30'
              }`}
              disabled={isCompleted}
            >
              {isCompleted ? '✓ 已完成' : '✓ 标记为完成'}
            </button>

            {/* Navigation */}
            <div className="flex items-center gap-3 ml-auto">
              {navigation.prev && (
                <Link href={navigation.prev.href} className="btn-ghost text-xs">
                  ← {navigation.prev.title}
                </Link>
              )}
              {navigation.next && (
                <Link href={navigation.next.href} className="btn-ghost text-xs">
                  {navigation.next.title} →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ─── Sidebar ──────────────────────────────────── */}
        <aside className="w-80 shrink-0 hidden lg:block">
          <div className="sticky top-20 space-y-6">
            {/* Mini Graph */}
            {graphNodeIds.length > 0 && (
              <div className="glass-card p-4">
                <h4 className="text-xs font-semibold text-cosmos-dim mb-3">🧭 关联知识图谱</h4>
                <MiniGraph nodeIds={graphNodeIds} />
              </div>
            )}

            {/* Lesson Info */}
            <div className="glass-card p-4 space-y-3">
              <h4 className="text-xs font-semibold text-cosmos-dim">📋 课时信息</h4>
              <div className="space-y-2 text-xs text-cosmos-dim">
                <div className="flex justify-between">
                  <span>所属路线</span>
                  <span className="text-cosmos-text">{track.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>模块</span>
                  <span className="text-cosmos-text">{mod.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>难度</span>
                  <DifficultyBadge difficulty={lesson.difficulty as 'beginner' | 'intermediate' | 'advanced'} />
                </div>
                <div className="flex justify-between">
                  <span>预计时长</span>
                  <span className="text-cosmos-text">{lesson.estimatedMinutes} 分钟</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {lesson.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {lesson.tags.map((tag: string) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-cosmos-bg text-cosmos-dim border border-cosmos-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Simple MDX content renderer — splits markdown into sections */
function MDXContent({ content }: { content: string }) {
  if (!content) return null;

  // Basic markdown rendering by splitting on headings and code blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={key++} className="my-4 rounded-xl overflow-hidden border border-cosmos-border bg-cosmos-bg">
          {language && (
            <div className="flex items-center justify-between px-4 py-2 bg-cosmos-surface/50 border-b border-cosmos-border">
              <span className="text-[10px] text-cosmos-dim font-mono">{language}</span>
              <button
                className="text-[10px] text-cosmos-dim hover:text-cosmos-text transition-colors"
                onClick={(e) => {
                  navigator.clipboard.writeText(codeLines.join('\n'));
                  (e.target as HTMLElement).textContent = '已复制!';
                  setTimeout(() => { (e.target as HTMLElement).textContent = '复制'; }, 2000);
                }}
              >
                复制
              </button>
            </div>
          )}
          <pre className="p-4 overflow-x-auto text-xs font-mono text-cosmos-text leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // h1
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      elements.push(
        <h1 key={key++} className="text-2xl font-bold text-cosmos-text font-display mt-8 mb-4">{line.slice(2)}</h1>
      );
      i++;
      continue;
    }

    // h2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-semibold text-cosmos-text font-display mt-6 mb-3 pb-2 border-b border-cosmos-border">{line.slice(3)}</h2>
      );
      i++;
      continue;
    }

    // h3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-cosmos-text mt-5 mb-2">{line.slice(4)}</h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key++} className="border-l-2 border-stellar-violet bg-stellar-violet/5 px-4 py-2 my-3 text-sm text-cosmos-dim italic rounded-r-lg">
          {quoteLines.join('\n')}
        </blockquote>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      elements.push(<hr key={key++} className="my-6 border-cosmos-border" />);
      i++;
      continue;
    }

    // Bold + inline code
    if (line.trim()) {
      const html = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-cosmos-text font-semibold">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="text-stellar-blue bg-cosmos-bg/50 px-1.5 py-0.5 rounded text-xs">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-stellar-blue hover:text-stellar-violet" target="_blank">$1</a>');
      elements.push(
        <p key={key++} className="text-sm text-cosmos-dim leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: html }} />
      );
    } else {
      elements.push(<div key={key++} className="h-3" />);
    }
    i++;
  }

  return <>{elements}</>;
}
