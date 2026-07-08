import { proxyRadarRequest } from '../_proxy'

export const dynamic = 'force-dynamic'

export async function GET() {
  return proxyRadarRequest('/radar/categories')
}
