export type LabStatus = 'Draft' | 'Verified';
export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LabDefinition {
  id: string;
  title: string;
  status: LabStatus;
  difficulty: LabDifficulty;
  estimatedSetupTime: string;
  estimatedCost: string;
  requiresApiKey: boolean;
  path: string;
  commands: string[];
  summary: string;
}

export const LABS: LabDefinition[] = [
  {
    id: 'secure-mcp-server',
    title: 'Secure MCP Server',
    status: 'Draft',
    difficulty: 'Intermediate',
    estimatedSetupTime: '15min',
    estimatedCost: '< $1',
    requiresApiKey: true,
    path: 'labs/secure-mcp-server',
    commands: [
      'cd labs/secure-mcp-server',
      'python -m venv .venv',
      'pip install -r requirements.txt',
      'python -m pytest tests -q',
      'python main.py',
    ],
    summary:
      'MCP Server baseline lab with tool allowlist, parameter validation, audit logs, and basic input protection.',
  },
  {
    id: 'production-agent-with-human-approval',
    title: 'Production Agent with Human Approval',
    status: 'Draft',
    difficulty: 'Intermediate',
    estimatedSetupTime: '20min',
    estimatedCost: '< $1',
    requiresApiKey: true,
    path: 'labs/production-agent-with-human-approval',
    commands: [
      'cd labs/production-agent-with-human-approval',
      'python -m venv .venv',
      'pip install -r requirements.txt',
      'python -m pytest tests -q',
      'python src/main.py',
    ],
    summary:
      'Production agent lab showing human approval, task state transitions, and operational boundaries.',
  },
];

export function getLabById(id: string): LabDefinition | null {
  return LABS.find((lab) => lab.id === id) || null;
}
