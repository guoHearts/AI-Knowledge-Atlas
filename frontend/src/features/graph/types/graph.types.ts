/** All type definitions matching backend Pydantic models */

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

export const NODE_COLORS: Record<NodeType, string> = {
  Technology: '#2358d8',
  Model: '#c78310',
  Product: '#0e8f72',
  AgentFramework: '#8b3f97',
  AgentType: '#cc4b4b',
  Company: '#16758f',
  Paper: '#66736d',
  Benchmark: '#17201c',
};

export const NODE_GLOWS: Record<NodeType, string> = {
  Technology: '#2358d8',
  Model: '#c78310',
  Product: '#0e8f72',
  AgentFramework: '#8b3f97',
  AgentType: '#cc4b4b',
  Company: '#16758f',
  Paper: '#66736d',
  Benchmark: '#17201c',
};

export const NODE_LABELS: Record<NodeType, string> = {
  Technology: '技术',
  Model: '模型',
  Product: '产品',
  AgentFramework: 'Agent 框架',
  AgentType: 'Agent 类型',
  Company: '公司',
  Paper: '论文',
  Benchmark: '评测',
};

export const NODE_EXPLAINERS: Record<NodeType, string> = {
  Technology: '方法、协议、工程能力或基础技术，例如 RAG、MCP、量化、语义缓存。',
  Model: '可以被调用或部署的大模型与多模态模型。',
  Product: '面向用户或开发者的 AI 产品、平台或工具。',
  AgentFramework: '帮助构建 Agent、工作流和工具调用的开发框架。',
  AgentType: 'Agent 的任务形态，例如代码 Agent、浏览器 Agent、多 Agent 协作。',
  Company: '技术、模型或产品背后的组织。',
  Paper: '支撑技术演进的研究论文，目前是需要补齐的重点。',
  Benchmark: '衡量模型、Agent 或系统能力的评测基准。',
};

export const RELATION_LABELS: Record<RelationType, string> = {
  BASED_ON: '基于',
  PROPOSED_BY: '提出方',
  RELEASED: '发布',
  COMPETES_WITH: '竞争',
  BELONGS_TO: '隶属',
  POWERS: '驱动',
  EVALUATED_BY: '被评测',
  CATEGORY_OF: '属于类别',
  IMPROVES: '改进',
};

export const RELATION_EXPLAINERS: Record<RelationType, string> = {
  BASED_ON: 'A 的实现或能力依赖 B。',
  PROPOSED_BY: 'A 由 B 首次提出或主导。',
  RELEASED: 'A 由 B 发布。',
  COMPETES_WITH: 'A 与 B 在同类场景中竞争。',
  BELONGS_TO: 'A 隶属于 B 或由 B 维护。',
  POWERS: 'A 为 B 提供核心能力。',
  EVALUATED_BY: 'A 可以用 B 衡量效果。',
  CATEGORY_OF: 'A 是 B 这个类别下的一个例子。',
  IMPROVES: 'A 对 B 做了增强或替代。',
};
