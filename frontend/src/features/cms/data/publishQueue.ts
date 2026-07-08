export interface PublishItem {
  id: string;
  title: string;
  type: 'lesson' | 'module' | 'track';
  status: 'draft' | 'review' | 'approved';
  author: string;
  updatedAt: string;
  changes: string;
}

export const MOCK_ITEMS: PublishItem[] = [
  {
    id: '1',
    title: '什么是 Agent？Agent vs 传统应用',
    type: 'lesson',
    status: 'review',
    author: 'AI Generator',
    updatedAt: '2026-06-06',
    changes: '新增课时',
  },
  {
    id: '2',
    title: 'Pipeline 模式——线性任务链',
    type: 'lesson',
    status: 'draft',
    author: 'AI Generator',
    updatedAt: '2026-06-05',
    changes: '更新实验代码',
  },
  {
    id: '3',
    title: 'Agent 设计模式',
    type: 'module',
    status: 'review',
    author: 'Admin',
    updatedAt: '2026-06-04',
    changes: '调整课时顺序',
  },
];
