import { getBackendInternalUrl } from '@/lib/env';
import { request } from '@/lib/request';
import type {
  RadarCategoriesData,
  RadarItem,
  RadarItemsData,
  WeeklyRadar,
} from '../types/radar.types';

type RadarRequestOptions = {
  baseUrl?: string;
};

function buildUrl(path: string, options: RadarRequestOptions = {}) {
  return `${options.baseUrl || ''}${path}`;
}

export function getRadarServerBaseUrl() {
  return getBackendInternalUrl();
}

export function listRadarItems(
  params: { category?: string } = {},
  options: RadarRequestOptions = {},
) {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category);
  const query = searchParams.toString();

  return request<RadarItemsData>(
    buildUrl(`/api/radar/items${query ? `?${query}` : ''}`, options),
  );
}

export function listRadarItemsFromBackend(
  params: { category?: string; locale?: string } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category);
  if (params.locale) searchParams.set('locale', params.locale);
  const query = searchParams.toString();

  return request<RadarItemsData>(
    `${getRadarServerBaseUrl()}/radar/items${query ? `?${query}` : ''}`,
  );
}

export function getRadarItem(id: string, options: RadarRequestOptions = {}) {
  return request<RadarItem>(
    buildUrl(`/api/radar/items/${encodeURIComponent(id)}`, options),
  );
}

export function getRadarItemFromBackend(id: string, locale?: string) {
  const query = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  return request<RadarItem>(
    `${getRadarServerBaseUrl()}/radar/items/${encodeURIComponent(id)}${query}`,
  );
}

export function listRadarCategories(options: RadarRequestOptions = {}) {
  return request<RadarCategoriesData>(
    buildUrl('/api/radar/categories', options),
  );
}

export function listRadarCategoriesFromBackend(locale?: string) {
  const query = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  return request<RadarCategoriesData>(
    `${getRadarServerBaseUrl()}/radar/categories${query}`,
  );
}

export function getWeeklyRadar(
  week: string,
  options: RadarRequestOptions = {},
) {
  return request<WeeklyRadar>(
    buildUrl(`/api/radar/weekly/${encodeURIComponent(week)}`, options),
  );
}
