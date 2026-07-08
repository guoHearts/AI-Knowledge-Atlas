import { getBackendInternalUrl } from '../../../lib/env';
import { request } from '../../../lib/request';

export interface HomeStats {
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  totalPatterns: number;
  completionRate: number;
}

export function getHomeStats(userId = 'default'): Promise<HomeStats> {
  const params = new URLSearchParams({ userId });
  return request<HomeStats>(
    `${getBackendInternalUrl()}/learning/home/stats?${params.toString()}`,
  );
}
