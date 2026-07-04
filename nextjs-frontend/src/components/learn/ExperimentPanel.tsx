'use client';

import { useState, useCallback } from 'react';
import type { ExperimentConfig, ExperimentTask } from '@/types/learning';

interface Props {
  config: ExperimentConfig;
  lessonId: string;
}

export function ExperimentPanel({ config, lessonId }: Props) {
  const [code, setCode] = useState(config.template);
  const [output, setOutput] = useState('');
  const [tasks, setTasks] = useState<ExperimentTask[]>(config.tasks.map(t => ({ ...t })));
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const toggleTask = useCallback((taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const runCode = useCallback(async () => {
    setRunning(true);
    setOutput('> 正在执行...\n');
    try {
      const res = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          experimentCode: code,
          experimentStatus: 'in_progress',
        }),
      });
      if (res.ok) {
        setOutput(prev => prev + '> [模拟执行] 代码已保存。\n> 在 Phase 2 中此功能将连接云端沙箱实际运行。\n\n> 预期输出参考：\n> ' + config.expectedOutput);
      } else {
        setOutput(prev => prev + '> 保存失败，请重试。\n');
      }
    } catch (err) {
      setOutput(prev => prev + `> 错误: ${err}\n`);
    }
    setRunning(false);
  }, [code, lessonId, config.expectedOutput]);

  const resetCode = useCallback(() => {
    setCode(config.template);
    setOutput('');
    setCompletedTasks(new Set());
  }, [config.template]);

  const verifyCompletion = useCallback(() => {
    const allDone = config.tasks.every(t => completedTasks.has(t.id));
    if (allDone) {
      fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          experimentStatus: 'verified',
        }),
      });
      setOutput(prev => prev + '\n> ✅ 所有任务已完成！实验验证通过。\n');
    }
  }, [completedTasks, config.tasks, lessonId]);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-cosmos-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-cosmos-text flex items-center gap-2">
            🔬 {config.title}
          </h3>
          <p className="text-xs text-cosmos-dim mt-0.5">{config.description}</p>
        </div>
        <span className="text-xs text-cosmos-dim">⏱️ 约 30-90 分钟</span>
      </div>

      <div className="flex">
        {/* Task checklist */}
        <div className="w-64 shrink-0 border-r border-cosmos-border p-4 space-y-2">
          <h4 className="text-xs font-semibold text-cosmos-dim mb-3">📋 任务清单</h4>
          {tasks.map((task) => (
            <label
              key={task.id}
              className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                completedTasks.has(task.id) ? 'bg-emerald-400/5' : 'hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="checkbox"
                checked={completedTasks.has(task.id)}
                onChange={() => toggleTask(task.id)}
                className="mt-0.5 accent-emerald-400"
              />
              <div className="flex-1 min-w-0">
                <span className={`text-xs ${completedTasks.has(task.id) ? 'text-cosmos-dim line-through' : 'text-cosmos-text'}`}>
                  {task.description}
                </span>
                {showHint === task.id && (
                  <p className="text-[10px] text-stellar-blue mt-1">💡 {task.hint}</p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowHint(showHint === task.id ? null : task.id);
                }}
                className="text-[10px] text-cosmos-dim hover:text-stellar-blue shrink-0"
              >
                提示
              </button>
            </label>
          ))}
          <button onClick={verifyCompletion} className="w-full text-xs text-stellar-blue hover:text-stellar-violet mt-2">
            验证完成状态
          </button>
        </div>

        {/* Code editor area */}
        <div className="flex-1 min-w-0">
          {/* Monaco-placeholder editor */}
          <div className="border-b border-cosmos-border bg-cosmos-bg">
            <div className="flex items-center justify-between px-4 py-2 bg-cosmos-surface/50 border-b border-cosmos-border">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/50" />
                <span className="w-3 h-3 rounded-full bg-amber-400/50" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/50" />
              </div>
              <span className="text-[10px] text-cosmos-dim font-mono">experiment.ts</span>
              <div />
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 bg-transparent text-xs font-mono text-cosmos-text p-4 resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-cosmos-border">
            <button
              onClick={runCode}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors disabled:opacity-50"
            >
              {running ? '⏳ 执行中...' : '▶ 运行'}
            </button>
            <button onClick={resetCode} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-cosmos-dim hover:text-cosmos-text hover:bg-white/[0.03] transition-colors">
              ↺ 重置
            </button>
            <button
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-cosmos-dim hover:text-cosmos-text hover:bg-white/[0.03] transition-colors ml-auto"
            >
              ❓ 遇到问题？
            </button>
          </div>

          {/* Output */}
          <div className="p-4 bg-cosmos-bg/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-cosmos-dim">输出</span>
            </div>
            <pre className="text-xs font-mono text-cosmos-dim leading-relaxed whitespace-pre-wrap min-h-[60px]">
              {output || '> 点击"运行"查看结果...'}
            </pre>
          </div>

          {/* Troubleshooting */}
          {showTroubleshooting && (
            <div className="p-4 border-t border-cosmos-border bg-amber-400/5">
              <h4 className="text-xs font-semibold text-amber-400 mb-2">🔧 常见坑与调试指南</h4>
              <p className="text-xs text-cosmos-dim whitespace-pre-wrap">{config.troubleshooting}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
