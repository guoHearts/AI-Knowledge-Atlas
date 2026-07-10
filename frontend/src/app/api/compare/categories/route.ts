import { proxyCompareRequest } from '../_proxy'

export const dynamic = 'force-dynamic'

export async function GET() {
  return proxyCompareRequest('/compare/categories')
}
