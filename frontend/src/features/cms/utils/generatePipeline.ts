export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'done' | 'error';
  description: string;
  detail?: string;
}

export const INITIAL_STEPS: PipelineStep[] = [
  { name: 'Knowledge retrieval', status: 'pending', description: 'Find related graph nodes and relationships.' },
  { name: 'Scenario research', status: 'pending', description: 'Collect enterprise use cases and practical constraints.' },
  { name: 'Outline generation', status: 'pending', description: 'Generate modules, lessons, and learning goals.' },
  { name: 'Lesson drafting', status: 'pending', description: 'Generate MDX content, experiment tasks, and checks.' },
  { name: 'Code verification', status: 'pending', description: 'Run sandbox validation and repair failed examples.' },
  { name: 'Consistency review', status: 'pending', description: 'Check terminology, flow, and difficulty progression.' },
];
