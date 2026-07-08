import { proxyRadarRequest } from '../_proxy'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const query = category ? `?category=${encodeURIComponent(category)}` : ''

  return proxyRadarRequest(`/radar/items${query}`)
}
