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
