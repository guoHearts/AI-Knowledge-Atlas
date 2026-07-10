import { getBackendInternalUrl } from '@/lib/env';
import { request } from '@/lib/request';
import type {
  CompareArticle,
  CompareArticlesData,
  CompareCategoriesData,
} from '../types/compare.types';

type CompareRequestOptions = {
  baseUrl?: string;
};

function buildUrl(path: string, options: CompareRequestOptions = {}) {
  return `${options.baseUrl || ''}${path}`;
}

export function getCompareServerBaseUrl() {
  return getBackendInternalUrl();
}

export function listCompareArticles(
  params: { category?: string } = {},
  options: CompareRequestOptions = {},
) {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category);
  const query = searchParams.toString();

  return request<CompareArticlesData>(
    buildUrl(`/api/compare/articles${query ? `?${query}` : ''}`, options),
  );
}

export function listCompareArticlesFromBackend(
  params: { category?: string; locale?: string } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category);
  if (params.locale) searchParams.set('locale', params.locale);
  const query = searchParams.toString();

  return request<CompareArticlesData>(
    `${getCompareServerBaseUrl()}/compare/articles${query ? `?${query}` : ''}`,
  );
}

export function getCompareArticle(id: string, options: CompareRequestOptions = {}) {
  return request<CompareArticle>(
    buildUrl(`/api/compare/articles/${encodeURIComponent(id)}`, options),
  );
}

export function getCompareArticleFromBackend(id: string, locale?: string) {
  const query = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  return request<CompareArticle>(
    `${getCompareServerBaseUrl()}/compare/articles/${encodeURIComponent(id)}${query}`,
  );
}

export function listCompareCategories(options: CompareRequestOptions = {}) {
  return request<CompareCategoriesData>(
    buildUrl('/api/compare/categories', options),
  );
}
