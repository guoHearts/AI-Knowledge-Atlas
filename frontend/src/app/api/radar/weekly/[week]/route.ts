import { proxyRadarRequest } from '../../_proxy'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ week: string }> },
) {
  const { week } = await context.params

  return proxyRadarRequest(`/radar/weekly/${encodeURIComponent(week)}`)
}
