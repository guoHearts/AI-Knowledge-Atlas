export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchGraphNodes(params?: {
  type?: string;
  limit?: number;
}): Promise<import('@/types/graph').GraphNode[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('node_type', params.type);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const res = await fetch(`${API_BASE}/graph/nodes?${searchParams}`);
  if (!res.ok) throw new Error(`Failed to fetch nodes: ${res.statusText}`);
  return res.json();
}

export async function fetchGraphEdges(limit = 2000): Promise<import('@/types/graph').GraphEdge[]> {
  const res = await fetch(`${API_BASE}/graph/edges?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch edges: ${res.statusText}`);
  return res.json();
}

export async function searchNodes(query: string): Promise<import('@/types/graph').GraphNode[]> {
  const res = await fetch(`${API_BASE}/graph/nodes/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Failed to search: ${res.statusText}`);
  return res.json();
}

export async function fetchNodeDetail(
  nodeType: string,
  nodeId: string
): Promise<import('@/types/graph').NodeDetail> {
  const res = await fetch(`${API_BASE}/graph/nodes/${nodeType}/${nodeId}`);
  if (!res.ok) throw new Error(`Failed to fetch node detail: ${res.statusText}`);
  return res.json();
}

export async function fetchSubgraph(
  ids: string[],
  depth = 1
): Promise<import('@/types/graph').Subgraph> {
  const searchParams = new URLSearchParams();
  ids.forEach((id) => searchParams.append('ids', id));
  searchParams.set('depth', String(depth));
  const res = await fetch(`${API_BASE}/graph/subgraph?${searchParams}`);
  if (!res.ok) throw new Error(`Failed to fetch subgraph: ${res.statusText}`);
  return res.json();
}

export async function fetchGraphStats(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/graph/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  return res.json();
}
