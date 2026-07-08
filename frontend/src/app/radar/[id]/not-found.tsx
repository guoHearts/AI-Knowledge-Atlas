import Link from 'next/link'

export default function RadarItemNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full border border-red-500/30 mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3v6m-3 3h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-cosmos-text mb-4">
            Radar 项目未找到
          </h1>
          <p className="text-lg text-cosmos-dim leading-relaxed">
            抱歉，请求的 Radar 项目不存在或已被移除。
            可能的技术还在研发中，或者链接有误。
          </p>
        </div>
        
        <div className="bg-cosmos-surface rounded-lg p-6 border border-cosmos-border mb-8">
          <h2 className="font-semibold text-cosmos-text mb-3">其他选择</h2>
          <ul className="text-cosmos-dim space-y-2 text-left">
            <li>• 检查页面地址是否正确</li>
            <li>• 技术可能还在审核中</li>
            <li>• 查看我们最新的技术雷达更新</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/radar"
            className="inline-flex items-center bg-stellar-green hover:bg-stellar-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            查看技术雷达
          </Link>
          <Link
            href="/labs"
            className="inline-flex items-center border border-cosmos-border text-cosmos-text hover:bg-cosmos-surface px-6 py-3 rounded-lg font-medium transition-colors"
          >
            浏览可运行实验
          </Link>
        </div>
      </div>
    </div>
  )
}