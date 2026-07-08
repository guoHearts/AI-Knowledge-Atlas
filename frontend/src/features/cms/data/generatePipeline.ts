export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'done' | 'error';
  description: string;
  detail?: string;
}

export const INITIAL_STEPS: PipelineStep[] = [
  { name: '知识检索', status: 'pending', description: '从 Neo4j 检索相关知识节点和关系' },
  { name: '企业场景调研', status: 'pending', description: '搜索最新企业实践和真实需求' },
  { name: '大纲生成', status: 'pending', description: 'LLM 生成模块+课时+学习目标' },
  { name: '逐课时生成', status: 'pending', description: '生成 MDX 内容+实验任务+自检清单' },
  { name: '代码验证', status: 'pending', description: '沙箱执行→自动修复→重新验证' },
  { name: '一致性检查', status: 'pending', description: '术语统一、前后矛盾、难度曲线检查' },
];
