'use client';

import { useCallback, useState } from 'react';
import {
  saveExperimentProgress,
  verifyExperimentProgress,
} from '@/features/progress/api/progressApi';
import type { ExperimentConfig } from '@/types/learning';

interface Props {
  config: ExperimentConfig;
  lessonId: string;
}

export function ExperimentPanel({ config, lessonId }: Props) {
  const [code, setCode] = useState(config.template);
  const [output, setOutput] = useState('');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const toggleTask = useCallback((taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const runCode = useCallback(async () => {
    setRunning(true);
    setOutput('> Saving experiment code...\n');
    try {
      await saveExperimentProgress(lessonId, code);
      setOutput((prev) => (
        `${prev}> [simulated run] Code saved.\n`
        + '> Cloud sandbox execution will be connected in a later phase.\n\n'
        + `> Expected output:\n> ${config.expectedOutput}`
      ));
    } catch (error) {
      setOutput((prev) => `${prev}> Error: ${error}\n`);
    } finally {
      setRunning(false);
    }
  }, [code, config.expectedOutput, lessonId]);

  const resetCode = useCallback(() => {
    setCode(config.template);
    setOutput('');
    setCompletedTasks(new Set());
  }, [config.template]);

  const verifyCompletion = useCallback(async () => {
    const allDone = config.tasks.every((task) => completedTasks.has(task.id));
    if (!allDone) return;

    try {
      await verifyExperimentProgress(lessonId);
      setOutput((prev) => `${prev}\n> All tasks completed. Experiment verified.\n`);
    } catch (error) {
      setOutput((prev) => `${prev}\n> Verification failed: ${error}\n`);
    }
  }, [completedTasks, config.tasks, lessonId]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-cosmos-border px-5 py-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-cosmos-text">
            Experiment: {config.title}
          </h3>
          <p className="mt-0.5 text-xs text-cosmos-dim">{config.description}</p>
        </div>
        <span className="text-xs text-cosmos-dim">30-90 min</span>
      </div>

      <div className="flex">
        <div className="w-64 shrink-0 space-y-2 border-r border-cosmos-border p-4">
          <h4 className="mb-3 text-xs font-semibold text-cosmos-dim">Tasks</h4>
          {config.tasks.map((task) => (
            <label
              key={task.id}
              className={`flex cursor-pointer items-start gap-2 rounded-lg p-2 transition-colors ${
                completedTasks.has(task.id) ? 'bg-emerald-400/5' : 'hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="checkbox"
                checked={completedTasks.has(task.id)}
                onChange={() => toggleTask(task.id)}
                className="mt-0.5 accent-emerald-400"
              />
              <div className="min-w-0 flex-1">
                <span className={`text-xs ${completedTasks.has(task.id) ? 'text-cosmos-dim line-through' : 'text-cosmos-text'}`}>
                  {task.description}
                </span>
                {showHint === task.id && (
                  <p className="mt-1 text-[10px] text-stellar-blue">{task.hint}</p>
                )}
              </div>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setShowHint(showHint === task.id ? null : task.id);
                }}
                className="shrink-0 text-[10px] text-cosmos-dim hover:text-stellar-blue"
              >
                Hint
              </button>
            </label>
          ))}
          <button onClick={verifyCompletion} className="mt-2 w-full text-xs text-stellar-blue hover:text-stellar-violet">
            Verify completion
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="border-b border-cosmos-border bg-cosmos-bg">
            <div className="flex items-center justify-between border-b border-cosmos-border bg-cosmos-surface/50 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/50" />
                <span className="h-3 w-3 rounded-full bg-amber-400/50" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/50" />
              </div>
              <span className="font-mono text-[10px] text-cosmos-dim">experiment.ts</span>
              <div />
            </div>
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="h-64 w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-cosmos-text focus:outline-none"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center gap-2 border-b border-cosmos-border px-4 py-2">
            <button
              onClick={runCode}
              disabled={running}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-400/20 disabled:opacity-50"
            >
              {running ? 'Running...' : 'Run'}
            </button>
            <button onClick={resetCode} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-cosmos-dim transition-colors hover:bg-white/[0.03] hover:text-cosmos-text">
              Reset
            </button>
            <button
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-cosmos-dim transition-colors hover:bg-white/[0.03] hover:text-cosmos-text"
            >
              Troubleshooting
            </button>
          </div>

          <div className="bg-cosmos-bg/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-cosmos-dim">Output</span>
            </div>
            <pre className="min-h-[60px] whitespace-pre-wrap font-mono text-xs leading-relaxed text-cosmos-dim">
              {output || '> Click Run to save code and view the simulated result...'}
            </pre>
          </div>

          {showTroubleshooting && (
            <div className="border-t border-cosmos-border bg-amber-400/5 p-4">
              <h4 className="mb-2 text-xs font-semibold text-amber-400">Troubleshooting</h4>
              <p className="whitespace-pre-wrap text-xs text-cosmos-dim">{config.troubleshooting}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
