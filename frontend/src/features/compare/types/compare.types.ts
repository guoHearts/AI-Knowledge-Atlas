export interface CompareSource {
  type: string;
  title: string;
  url: string;
}

export interface CompareContender {
  name: string;
  vendor: string;
  latest_version: string;
  one_liner: string;
}

export interface CompareDimension {
  name: string;
  values: Record<string, string>;
}

export interface CompareScenario {
  contender: string;
  scenario: string;
}

export interface CompareDecision {
  condition: string;
  recommendation: string;
}

export interface CompareArticle {
  id: string;
  title: string;
  category: string;
  status: string;
  summary: string;
  contenders: CompareContender[];
  dimensions: CompareDimension[];
  use_when: CompareScenario[];
  avoid_when: CompareScenario[];
  decision_tree: CompareDecision[];
  cost_notes: string[];
  sources: CompareSource[];
  related_lab_ids: string[];
  related_radar_item_ids: string[];
  related_node_ids: string[];
  related_learning_paths: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  last_verified_at: string;
}

export interface CompareCategory {
  id: string;
  name: string;
  description: string;
}

export interface CompareArticlesData {
  articles: CompareArticle[];
}

export interface CompareCategoriesData {
  items: CompareCategory[];
}
