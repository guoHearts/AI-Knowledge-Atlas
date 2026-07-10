import { getBackendInternalUrl } from '@/lib/env';
import { ApiError, request } from '@/lib/request';
import type { LabDefinition } from '../utils/labs';

function labsUrl(path = '', locale?: string): string {
  const query = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  return `${getBackendInternalUrl()}/learning/labs${path}${query}`;
}

export function listLabs(locale?: string): Promise<LabDefinition[]> {
  return request<LabDefinition[]>(labsUrl('', locale));
}

export async function getLabById(id: string, locale?: string): Promise<LabDefinition | null> {
  try {
    return await request<LabDefinition>(labsUrl(`/${encodeURIComponent(id)}`, locale));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
