export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type ExperimentStatus = 'not_started' | 'in_progress' | 'verified';
export type PatternCategory = 'orchestration' | 'collaboration' | 'quality' | 'architecture';

export interface LearningTrackRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  difficulty: string;
  estimated_hours: number | null;
  prerequisites: string | null;
  outcome_skills: string | null;
  outcome_project: string | null;
  icon: string | null;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleRow {
  id: string;
  track_id: string;
  title: string;
  description: string | null;
  stage: number;
  sort_order: number;
  estimated_hours: number | null;
  difficulty: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LessonRow {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  content_path: string | null;
  sort_order: number;
  difficulty: string;
  estimated_minutes: number | null;
  analogy: string | null;
  one_liner: string | null;
  experiment_config: string | null;
  design_pattern_id: string | null;
  graph_node_ids: string | null;
  tags: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  status: string;
  experiment_status: string | null;
  experiment_code: string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  time_spent_seconds: number;
}

export interface DesignPatternRow {
  id: string;
  name: string;
  title: string;
  category: string;
  description: string | null;
  motivation: string | null;
  structure_diagram: string | null;
  implementation_guide: string | null;
  code_example_langchain: string | null;
  code_example_anthropic: string | null;
  tradeoffs: string | null;
  when_to_use: string | null;
  when_not_to_use: string | null;
  related_pattern_ids: string | null;
  related_graph_nodes: string | null;
  enterprise_scenario: string | null;
  interview_questions: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningTrack {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  estimatedHours: number;
  prerequisites: string;
  outcomeSkills: string[];
  outcomeProject: string;
  icon: string;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  trackId: string;
  title: string;
  description: string;
  stage: number;
  sortOrder: number;
  estimatedHours: number;
  difficulty: Difficulty;
  status: ContentStatus;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  contentPath: string;
  sortOrder: number;
  difficulty: Difficulty;
  estimatedMinutes: number;
  analogy: string;
  oneLiner: string;
  experimentConfig: ExperimentConfig | null;
  designPatternId: string | null;
  graphNodeIds: string[];
  tags: string[];
  status: ContentStatus;
}

export interface ExperimentConfig {
  title: string;
  description: string;
  template: string;
  tasks: ExperimentTask[];
  expectedOutput: string;
  troubleshooting: string;
}

export interface ExperimentTask {
  id: string;
  description: string;
  hint: string;
  verification: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: ProgressStatus;
  experimentStatus: ExperimentStatus;
  experimentCode: string;
  notes: string;
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number;
}

export interface DesignPattern {
  id: string;
  name: string;
  title: string;
  category: PatternCategory;
  description: string;
  motivation: string;
  structureDiagram: string;
  implementationGuide: string;
  codeExampleLangchain: string;
  codeExampleAnthropic: string;
  tradeoffs: string;
  whenToUse: string;
  whenNotToUse: string;
  relatedPatternIds: string[];
  relatedGraphNodes: string[];
  enterpriseScenario: string;
  interviewQuestions: string;
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface TrackWithModules extends LearningTrack {
  modules: ModuleWithLessons[];
}

export interface UserStats {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalTimeSpentSeconds: number;
  completionRate: number;
  trackProgress: Record<string, number>;
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '深入',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: 'text-stellar-emerald bg-stellar-emerald/10 border-stellar-emerald/25',
  intermediate: 'text-stellar-amber bg-stellar-amber/10 border-stellar-amber/25',
  advanced: 'text-stellar-rose bg-stellar-rose/10 border-stellar-rose/25',
};

export const CATEGORY_LABELS: Record<PatternCategory, string> = {
  orchestration: '基础编排',
  collaboration: '协作模式',
  quality: '质量保障',
  architecture: '架构模式',
};

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toTrack(row: LearningTrackRow): LearningTrack {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    difficulty: row.difficulty as Difficulty,
    estimatedHours: row.estimated_hours ?? 0,
    prerequisites: row.prerequisites || '',
    outcomeSkills: safeJsonParse<string[]>(row.outcome_skills, []),
    outcomeProject: row.outcome_project || '',
    icon: row.icon || 'AI',
    sortOrder: row.sort_order,
    status: row.status as ContentStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toModule(row: ModuleRow): Module {
  return {
    id: row.id,
    trackId: row.track_id,
    title: row.title,
    description: row.description || '',
    stage: row.stage,
    sortOrder: row.sort_order,
    estimatedHours: row.estimated_hours ?? 0,
    difficulty: row.difficulty as Difficulty,
    status: row.status as ContentStatus,
  };
}

export function toLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    slug: row.slug,
    contentPath: row.content_path || '',
    sortOrder: row.sort_order,
    difficulty: row.difficulty as Difficulty,
    estimatedMinutes: row.estimated_minutes ?? 45,
    analogy: row.analogy || '',
    oneLiner: row.one_liner || '',
    experimentConfig: safeJsonParse<ExperimentConfig | null>(row.experiment_config, null),
    designPatternId: row.design_pattern_id,
    graphNodeIds: safeJsonParse<string[]>(row.graph_node_ids, []),
    tags: safeJsonParse<string[]>(row.tags, []),
    status: row.status as ContentStatus,
  };
}

export function toUserProgress(row: UserProgressRow): UserProgress {
  return {
    id: row.id,
    userId: row.user_id,
    lessonId: row.lesson_id,
    status: row.status as ProgressStatus,
    experimentStatus: (row.experiment_status || 'not_started') as ExperimentStatus,
    experimentCode: row.experiment_code || '',
    notes: row.notes || '',
    startedAt: row.started_at,
    completedAt: row.completed_at,
    timeSpentSeconds: row.time_spent_seconds ?? 0,
  };
}

export function toDesignPattern(row: DesignPatternRow): DesignPattern {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    category: row.category as PatternCategory,
    description: row.description || '',
    motivation: row.motivation || '',
    structureDiagram: row.structure_diagram || '',
    implementationGuide: row.implementation_guide || '',
    codeExampleLangchain: row.code_example_langchain || '',
    codeExampleAnthropic: row.code_example_anthropic || '',
    tradeoffs: row.tradeoffs || '',
    whenToUse: row.when_to_use || '',
    whenNotToUse: row.when_not_to_use || '',
    relatedPatternIds: safeJsonParse<string[]>(row.related_pattern_ids, []),
    relatedGraphNodes: safeJsonParse<string[]>(row.related_graph_nodes, []),
    enterpriseScenario: row.enterprise_scenario || '',
    interviewQuestions: row.interview_questions || '',
  };
}
