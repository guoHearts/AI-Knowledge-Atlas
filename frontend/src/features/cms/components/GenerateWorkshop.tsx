'use client';

import { useState } from 'react';

import { INITIAL_STEPS, type PipelineStep } from '../utils/generatePipeline';

function resetSteps(): PipelineStep[] {
  return INITIAL_STEPS.map((step) => ({ ...step }));
}

export function GenerateWorkshop() {
  const [topic, setTopic] = useState('');
  const [steps, setSteps] = useState<PipelineStep[]>(resetSteps);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim() || running) return;

    const currentSteps = resetSteps();
    setSteps(currentSteps);
    setRunning(true);
    setLog([]);

    for (let index = 0; index < currentSteps.length; index++) {
      const step = currentSteps[index];
      setSteps((prev) => prev.map((item, itemIndex) => (
        itemIndex === index
          ? { ...item, status: 'running' }
          : itemIndex < index
            ? { ...item, status: 'done' }
            : item
      )));
      setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Running: ${step.name}`]);

      await new Promise((resolve) => {
        window.setTimeout(resolve, 500);
      });

      setSteps((prev) => prev.map((item, itemIndex) => (
        itemIndex === index ? { ...item, status: 'done', detail: 'Done' } : item
      )));
      setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Done: ${step.name}`]);
    }

    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Generation finished for "${topic}".`]);
    setRunning(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-2 font-display text-2xl font-bold text-cosmos-text">Generation workshop</h1>
      <p className="mb-8 text-sm text-cosmos-dim">Run the AI-assisted content generation pipeline.</p>

      <div className="glass-card mb-8 p-6">
        <h3 className="mb-3 text-sm font-bold text-cosmos-text">Generation target</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Enter a lesson topic, for example: production agent observability"
            className="flex-1 rounded-xl border border-cosmos-border bg-cosmos-bg/50 px-4 py-3 text-sm text-cosmos-text placeholder:text-cosmos-dim focus:border-stellar-blue/40 focus:outline-none"
            disabled={running}
          />
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || running}
            className="btn-primary px-6 py-3 disabled:opacity-50"
          >
            {running ? 'Generating...' : 'Start'}
          </button>
        </div>
      </div>

      <div className="glass-card mb-8 p-6">
        <h3 className="mb-4 text-sm font-bold text-cosmos-text">Pipeline status</h3>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.name}
              className={`flex items-center gap-4 rounded-xl p-3 transition-all ${
                step.status === 'running'
                  ? 'border border-stellar-blue/20 bg-stellar-blue/10'
                  : step.status === 'done'
                    ? 'bg-emerald-400/5'
                    : step.status === 'error'
                      ? 'border border-red-400/20 bg-red-400/5'
                      : ''
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.status === 'done' ? 'bg-emerald-400/20 text-emerald-400'
                  : step.status === 'running' ? 'bg-stellar-blue/20 text-stellar-blue'
                    : step.status === 'error' ? 'bg-red-400/20 text-red-400'
                      : 'bg-cosmos-bg text-cosmos-dim'
              }`}>
                {step.status === 'done' ? 'OK' : index + 1}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-cosmos-text">{step.name}</span>
                <p className="mt-0.5 text-xs text-cosmos-dim">{step.description}</p>
              </div>
              {step.detail && <span className="text-xs text-cosmos-dim">{step.detail}</span>}
            </div>
          ))}
        </div>
      </div>

      {log.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="mb-3 text-sm font-bold text-cosmos-text">Execution log</h3>
          <pre className="max-h-60 overflow-y-auto font-mono text-xs leading-relaxed text-cosmos-dim">
            {log.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
