export interface PublishItem {
  id: string;
  title: string;
  type: 'lesson' | 'module' | 'track';
  status: 'draft' | 'review' | 'approved';
  author: string;
  updatedAt: string;
  changes: string;
}

export const PUBLISH_QUEUE_ITEMS: PublishItem[] = [
  {
    id: '1',
    title: 'What is an Agent: agent apps vs traditional apps',
    type: 'lesson',
    status: 'review',
    author: 'AI Generator',
    updatedAt: '2026-06-06',
    changes: 'New lesson draft',
  },
  {
    id: '2',
    title: 'Pipeline pattern: linear task chains',
    type: 'lesson',
    status: 'draft',
    author: 'AI Generator',
    updatedAt: '2026-06-05',
    changes: 'Updated experiment code',
  },
  {
    id: '3',
    title: 'Agent design patterns',
    type: 'module',
    status: 'review',
    author: 'Admin',
    updatedAt: '2026-06-04',
    changes: 'Adjusted lesson order',
  },
];
