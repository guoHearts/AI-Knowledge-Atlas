export type LabStatus = 'Draft' | 'Verified';
export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LabPackage {
  name: string;
  version: string;
}

export interface LabSource {
  type: 'official' | 'paper' | 'community' | string;
  title: string;
  url: string;
}

export interface LabFailureMode {
  title: string;
  resolution: string;
}

export interface LabRelatedPath {
  title: string;
  href: string;
}

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
  lastVerifiedAt?: string;
  packages?: LabPackage[];
  sources?: LabSource[];
  expectedOutputs?: string[];
  failureModes?: LabFailureMode[];
  securityNotes?: string[];
  knownLimitations?: string[];
  relatedRadarItemIds?: string[];
  relatedCompareIds?: string[];
  relatedNodeIds?: string[];
  relatedLearningPaths?: LabRelatedPath[];
}

function hasItems<T>(items: T[] | undefined): boolean {
  return Array.isArray(items) && items.length > 0;
}

export function hasVerifiedLabEvidence(lab: LabDefinition): boolean {
  if (lab.status !== 'Verified') return false;

  return Boolean(
    lab.lastVerifiedAt &&
      hasItems(lab.packages) &&
      hasItems(lab.sources) &&
      lab.sources?.some((source) => source.type === 'official') &&
      hasItems(lab.expectedOutputs) &&
      hasItems(lab.failureModes) &&
      hasItems(lab.securityNotes) &&
      hasItems(lab.knownLimitations) &&
      hasItems(lab.relatedRadarItemIds) &&
      hasItems(lab.relatedNodeIds) &&
      hasItems(lab.relatedLearningPaths),
  );
}
