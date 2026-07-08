'use client';

import { useState } from 'react';
import { INITIAL_STEPS, type PipelineStep } from '@/features/cms/data/generatePipeline';

export default function GeneratePage() {
  const [topic, setTopic] = useState('');
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim() || running) return;
    setRunning(true);
    setLog([]);

    // Simulate pipeline execution
    for (let i = 0; i < steps.length; i++) {
      setSteps(prev => prev.map((s, j) =>
        j === i ? { ...s, status: 'running' as const } :
        j < i ? { ...s, status: 'done' as const } : s
      ));
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 执行: ${steps[i].name}...`]);

      // Simulate processing time
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

      setSteps(prev => prev.map((s, j) =>
        j === i ? { ...s, status: 'done' as const, detail: '完成 ✓' } : s
      ));
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✓ ${steps[i].name} 完成`]);
    }

    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🎉 内容生成完成！请进入编辑器进行人工审核和发布。`]);
    setRunning(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-cosmos-text font-display mb-2">生成工坊</h1>
      <p className="text-sm text-cosmos-dim mb-8">AI 驱动的课程内容生成管线 —— 输入主题，自动生成完整课时</p>

      {/* Input */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-sm font-bold text-cosmos-text mb-3">🎯 生成目标</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="输入要生成的课程主题，如：企业级 Agent 可观测性"
            className="flex-1 bg-cosmos-bg/50 border border-cosmos-border rounded-xl px-4 py-3 text-sm text-cosmos-text placeholder:text-cosmos-dim focus:outline-none focus:border-stellar-blue/40"
            disabled={running}
          />
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || running}
            className="btn-primary px-6 py-3 disabled:opacity-50"
          >
            {running ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-stellar-blue/30 border-t-stellar-blue rounded-full animate-spin" />
                生成中...
              </span>
            ) : '🤖 开始生成'}
          </button>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-sm font-bold text-cosmos-text mb-4">📊 生成管线状态</h3>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div
              key={step.name}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                step.status === 'running'
                  ? 'bg-stellar-blue/10 border border-stellar-blue/20'
                  : step.status === 'done'
                    ? 'bg-emerald-400/5'
                    : step.status === 'error'
                      ? 'bg-red-400/5 border border-red-400/20'
                      : ''
              }`}
            >
              {/* Step indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                step.status === 'done' ? 'bg-emerald-400/20 text-emerald-400' :
                step.status === 'running' ? 'bg-stellar-blue/20 text-stellar-blue animate-pulse' :
                step.status === 'error' ? 'bg-red-400/20 text-red-400' :
                'bg-cosmos-bg text-cosmos-dim'
              }`}>
                {step.status === 'done' ? '✓' :
                 step.status === 'running' ? '⌛' :
                 step.status === 'error' ? '✕' : i + 1}
              </div>
              <div className="flex-1">
                <span className={`text-sm font-medium ${
                  step.status === 'done' ? 'text-emerald-400' :
                  step.status === 'running' ? 'text-stellar-blue' :
                  step.status === 'error' ? 'text-red-400' :
                  'text-cosmos-dim'
                }`}>
                  {step.name}
                </span>
                <p className="text-xs text-cosmos-dim mt-0.5">{step.description}</p>
              </div>
              {step.detail && <span className="text-xs text-cosmos-dim">{step.detail}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-cosmos-text mb-3">📝 执行日志</h3>
          <pre className="text-xs font-mono text-cosmos-dim leading-relaxed max-h-60 overflow-y-auto">
            {log.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
