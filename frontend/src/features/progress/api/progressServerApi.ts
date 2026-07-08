import { getBackendInternalUrl } from '../../../lib/env';
import { request } from '../../../lib/request';
import type { UserProgressRow } from '../../learn/types/learning';

export type ProgressUpsertInput = {
  lessonId: string;
  userId?: string;
  status?: string;
  experimentStatus?: string;
  experimentCode?: string;
  notes?: string;
};

export function listUserProgressRows(userId = 'default'): Promise<UserProgressRow[]> {
  const params = new URLSearchParams({ userId });
  return request<UserProgressRow[]>(
    `${getBackendInternalUrl()}/learning/progress?${params.toString()}`,
  );
}

export function upsertLessonProgress(input: ProgressUpsertInput): Promise<UserProgressRow> {
  return request<UserProgressRow>(
    `${getBackendInternalUrl()}/learning/progress`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
}
