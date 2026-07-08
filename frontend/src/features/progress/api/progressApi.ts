import { request } from '../../../lib/request';
import type { UserProgressRow } from '../../learn/types/learning';

export function markLessonProgress(
  lessonId: string,
  status: 'in_progress' | 'completed',
): Promise<UserProgressRow> {
  return request<UserProgressRow>('/api/progress', {
    method: 'PUT',
    body: JSON.stringify({ lessonId, status }),
  });
}

export function saveExperimentProgress(
  lessonId: string,
  experimentCode: string,
): Promise<UserProgressRow> {
  return request<UserProgressRow>('/api/progress', {
    method: 'PUT',
    body: JSON.stringify({
      lessonId,
      experimentCode,
      experimentStatus: 'in_progress',
    }),
  });
}

export function verifyExperimentProgress(lessonId: string): Promise<UserProgressRow> {
  return request<UserProgressRow>('/api/progress', {
    method: 'PUT',
    body: JSON.stringify({
      lessonId,
      experimentStatus: 'verified',
    }),
  });
}
