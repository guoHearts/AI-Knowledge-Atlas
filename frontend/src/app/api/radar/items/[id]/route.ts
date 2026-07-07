import { proxyRadarRequest } from '../../_proxy'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  return proxyRadarRequest(`/radar/items/${encodeURIComponent(id)}`)
}
