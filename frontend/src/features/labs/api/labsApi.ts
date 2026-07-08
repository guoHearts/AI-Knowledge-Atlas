import { getBackendInternalUrl } from '@/lib/env';
import { ApiError, request } from '@/lib/request';
import type { LabDefinition } from '../utils/labs';

function labsUrl(path = ''): string {
  return `${getBackendInternalUrl()}/learning/labs${path}`;
}

export function listLabs(): Promise<LabDefinition[]> {
  return request<LabDefinition[]>(labsUrl());
}

export async function getLabById(id: string): Promise<LabDefinition | null> {
  try {
    return await request<LabDefinition>(labsUrl(`/${encodeURIComponent(id)}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
