/** All type definitions matching backend Pydantic models in backend/models/graph.py */

export type NodeType =
  | 'Technology'
  | 'Model'
  | 'Product'
  | 'AgentFramework'
  | 'AgentType'
  | 'Company'
  | 'Paper'
  | 'Benchmark';

export type RelationType =
  | 'BASED_ON'
  | 'PROPOSED_BY'
  | 'RELEASED'
  | 'COMPETES_WITH'
  | 'BELONGS_TO'
  | 'POWERS'
  | 'EVALUATED_BY'
  | 'CATEGORY_OF'
  | 'IMPROVES';

export interface GraphNode {
  id: string;
  name: string;
  node_type: NodeType;
  description: string;
  summary_zh: string;
  source_urls: string[];
  first_seen: string | null;
  last_updated: string | null;
  popularity: number;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  source_id: string;
  target_id: string;
  relation: RelationType;
  weight: number;
  evidence: string;
}

export interface Subgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NodeDetail {
  node: GraphNode | null;
  incoming: GraphEdge[];
  outgoing: GraphEdge[];
  neighbor_nodes: GraphNode[];
}

/** Luminous node colors optimized for dark background */
export const NODE_COLORS: Record<NodeType, string> = {
  Technology: '#818cf8',    // soft indigo
  Model: '#fbbf24',         // amber
  Product: '#34d399',       // emerald
  AgentFramework: '#a78bfa', // violet
  AgentType: '#f472b6',     // rose
  Company: '#60a5fa',       // blue
  Paper: '#94a3b8',         // slate
  Benchmark: '#f87171',     // red
};

/** Node glow colors — slightly lighter for the radial gradient */
export const NODE_GLOWS: Record<NodeType, string> = {
  Technology: '#a5b4fc',
  Model: '#fcd34d',
  Product: '#6ee7b7',
  AgentFramework: '#c4b5fd',
  AgentType: '#f9a8d4',
  Company: '#93bbfd',
  Paper: '#cbd5e1',
  Benchmark: '#fca5a5',
};

export const NODE_LABELS: Record<NodeType, string> = {
  Technology: '技术',
  Model: '模型',
  Product: '产品',
  AgentFramework: 'Agent框架',
  AgentType: 'Agent类型',
  Company: '公司',
  Paper: '论文',
  Benchmark: '评测',
};

export const NODE_ICONS: Record<NodeType, string> = {
  Technology: '⚙',
  Model: '◇',
  Product: '◆',
  AgentFramework: '⬡',
  AgentType: '◎',
  Company: '⬢',
  Paper: '▣',
  Benchmark: '◈',
};

export const RELATION_LABELS: Record<RelationType, string> = {
  BASED_ON: '基于',
  PROPOSED_BY: '提出',
  RELEASED: '发布',
  COMPETES_WITH: '竞争',
  BELONGS_TO: '属于',
  POWERS: '驱动',
  EVALUATED_BY: '评测',
  CATEGORY_OF: '属于类别',
  IMPROVES: '改进',
};
