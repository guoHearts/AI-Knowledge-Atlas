import { getBackendInternalUrl } from '../../../lib/env';
import { request } from '../../../lib/request';

export interface CmsTrackRow {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
  status: string;
}

export interface CmsTrackSummary extends CmsTrackRow {
  moduleCount: number;
  lessonCount: number;
}

export interface CmsDashboardData {
  stats: {
    trackCount: number;
    publishedLessonCount: number;
    draftLessonCount: number;
    designPatternCount: number;
  };
  tracks: CmsTrackSummary[];
}

export function getCmsDashboardData(): Promise<CmsDashboardData> {
  return request<CmsDashboardData>(
    `${getBackendInternalUrl()}/learning/cms/dashboard`,
  );
}
