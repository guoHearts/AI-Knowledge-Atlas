import { getPublicApiUrl } from '../../../lib/env';
import { request } from '../../../lib/request';
import type {
  GraphEdge,
  GraphNode,
  NodeDetail,
  NodeType,
  Subgraph,
} from '../types/graph.types';

interface ItemsData<T> {
  items: T[];
}

function graphUrl(path: string) {
  return `${getPublicApiUrl()}${path}`;
}

export function listGraphNodes(params: { type?: NodeType; limit?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set('node_type', params.type);
  if (params.limit) searchParams.set('limit', String(params.limit));
  const query = searchParams.toString();

  return request<ItemsData<GraphNode>>(graphUrl(`/graph/nodes${query ? `?${query}` : ''}`))
    .then((data) => data.items);
}

export function listGraphEdges(limit = 2000) {
  return request<ItemsData<GraphEdge>>(graphUrl(`/graph/edges?limit=${limit}`))
    .then((data) => data.items);
}

export function searchGraphNodes(query: string) {
  const searchParams = new URLSearchParams({ q: query });
  return request<ItemsData<GraphNode>>(graphUrl(`/graph/nodes/search?${searchParams}`))
    .then((data) => data.items);
}

export function getGraphNodeDetail(nodeType: string, nodeId: string) {
  return request<NodeDetail>(
    graphUrl(`/graph/nodes/${encodeURIComponent(nodeType)}/${encodeURIComponent(nodeId)}`),
  );
}

export function getGraphSubgraph(ids: string[], depth = 1) {
  const searchParams = new URLSearchParams();
  ids.forEach((id) => searchParams.append('ids', id));
  searchParams.set('depth', String(depth));

  return request<Subgraph>(graphUrl(`/graph/subgraph?${searchParams}`));
}

export function getGraphStats() {
  return request<Record<string, unknown>>(graphUrl('/graph/stats'));
}
