import { getBackendInternalUrl } from '../../../lib/env';
import { request } from '../../../lib/request';

export interface HomeStats {
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  totalPatterns: number;
  completionRate: number;
}

export interface RoadmapItem {
  layer: string;
  title: string;
  eyebrow: string;
  description: string;
  modules: string;
  accent: string;
}

export interface HomeContent {
  roadmap: RoadmapItem[];
  nextSteps: string[];
}

export function getHomeStats(userId = 'default'): Promise<HomeStats> {
  const params = new URLSearchParams({ userId });
  return request<HomeStats>(
    `${getBackendInternalUrl()}/learning/home/stats?${params.toString()}`,
  );
}

export function getHomeContent(): Promise<HomeContent> {
  return request<HomeContent>(`${getBackendInternalUrl()}/learning/home/content`);
}
