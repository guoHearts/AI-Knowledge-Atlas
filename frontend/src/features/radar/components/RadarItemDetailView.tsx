import Link from 'next/link';
import type { RadarItem } from '../types/radar.types';
import { getCategoryColor, getMaturityColor, getStatusColor } from './RadarItemCard';
import { translateMaturity, translateStatus } from '@/lib/contentLabels';

function formatCategory(category: string) {
  return category.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

interface RadarItemDetailViewProps {
  item: RadarItem;
  locale: string;
}

export function RadarItemDetailView({ item, locale }: RadarItemDetailViewProps) {
  return (
    <div className="bg-cosmos-surface rounded-lg p-8 border border-cosmos-border">
      <div className="flex items-center gap-3 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(item.category)}`}>
          {formatCategory(item.category)}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMaturityColor(item.maturity)}`}>
          {translateMaturity(item.maturity, locale)}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
          {translateStatus(item.status, locale)}
        </span>
        {item.has_lab && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-stellar-green text-white">
            有实验
          </span>
        )}
      </div>

      <h1 className="font-display text-3xl font-bold leading-tight text-cosmos-text mb-6">
        {item.title}
      </h1>

      <div className="mb-8">
        <p className="text-lg text-cosmos-dim leading-relaxed">
          {item.summary}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-cosmos-text mb-3">为什么重要</h2>
          <p className="text-cosmos-dim leading-relaxed">
            {item.why_it_matters}
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-lg font-semibold text-cosmos-text mb-3">适合</h2>
            <p className="text-cosmos-dim leading-relaxed">
              {item.recommended_for}
            </p>
          </section>

          {item.not_recommended_for && (
            <section>
              <h2 className="text-lg font-semibold text-cosmos-text mb-3">不适合</h2>
              <p className="text-cosmos-dim leading-relaxed">
                {item.not_recommended_for}
              </p>
            </section>
          )}
        </div>

        {item.has_lab && item.lab_id && (
          <section>
            <h2 className="text-xl font-semibold text-cosmos-text mb-3">动手实验</h2>
            <div className="bg-stellar-green/10 border border-stellar-green/30 rounded-lg p-4">
              <p className="text-cosmos-dim mb-3">
                通过配套实验验证这项技术的适用边界和运行结果。
              </p>
              <Link
                href={`/labs/${item.lab_id}`}
                className="inline-flex items-center bg-stellar-green hover:bg-stellar-green/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                运行实验
              </Link>
            </div>
          </section>
        )}

        {item.sources.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-cosmos-text mb-3">来源与引用</h2>
            <div className="space-y-3">
              {item.sources.map((source) => (
                <div key={source.url} className="flex items-start gap-3 p-3 bg-cosmos-surface/50 rounded-lg border border-cosmos-border/50">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      source.type === 'official' ? 'bg-stellar-green' :
                        source.type === 'blog' ? 'bg-stellar-blue' :
                          source.type === 'research' ? 'bg-purple-500' :
                            'bg-cosmos-dim'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-cosmos-text mb-1">{source.title}</h3>
                    <div className="flex items-center gap-2">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cosmos-dim hover:text-cosmos-text transition-colors underline"
                      >
                        查看原文
                      </a>
                      <span className="text-xs text-cosmos-dim">
                        {source.type === 'official' ? '官方' :
                          source.type === 'blog' ? '博客' :
                            source.type === 'research' ? '研究' :
                              source.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(item.related_node_ids.length > 0 || item.related_learning_paths.length > 0) && (
          <section>
            <h2 className="text-xl font-semibold text-cosmos-text mb-3">关联路径</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {item.related_node_ids.length > 0 && (
                <div className="rounded-lg border border-cosmos-border bg-cosmos-bg p-4">
                  <h3 className="mb-2 text-sm font-medium text-cosmos-text">图谱节点</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.related_node_ids.map((nodeId) => (
                      <Link
                        key={nodeId}
                        href={`/graph?focus=${encodeURIComponent(nodeId)}`}
                        className="rounded border border-cosmos-border px-2 py-1 text-xs text-cosmos-dim transition-colors hover:text-cosmos-text"
                      >
                        {nodeId}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {item.related_learning_paths.length > 0 && (
                <div className="rounded-lg border border-cosmos-border bg-cosmos-bg p-4">
                  <h3 className="mb-2 text-sm font-medium text-cosmos-text">学习路线</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.related_learning_paths.map((path) => (
                      <Link
                        key={path}
                        href={path}
                        className="rounded border border-cosmos-border px-2 py-1 text-xs text-cosmos-dim transition-colors hover:text-cosmos-text"
                      >
                        {path}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="pt-6 border-t border-cosmos-border">
          <h2 className="text-lg font-semibold text-cosmos-text mb-3">元数据</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-cosmos-dim">ID:</span>
              <code className="ml-2 text-cosmos-text font-mono">{item.id}</code>
            </div>
            <div>
              <span className="text-cosmos-dim">发布时间:</span>
              <span className="ml-2 text-cosmos-text">{new Date(item.published_at).toLocaleDateString('zh-CN')}</span>
            </div>
            <div>
              <span className="text-cosmos-dim">状态:</span>
              <span className="ml-2 text-cosmos-text">{translateStatus(item.status, locale)}</span>
            </div>
            <div>
              <span className="text-cosmos-dim">创建时间:</span>
              <span className="ml-2 text-cosmos-text">{new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            <div>
              <span className="text-cosmos-dim">最后更新:</span>
              <span className="ml-2 text-cosmos-text">{new Date(item.updated_at).toLocaleDateString('zh-CN')}</span>
            </div>
            <div>
              <span className="text-cosmos-dim">最后验证:</span>
              <span className="ml-2 text-cosmos-text">{new Date(item.last_verified_at).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-cosmos-border">
        <Link
          href="/radar"
          className="inline-flex items-center bg-stellar-green hover:bg-stellar-green/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          查看完整雷达
        </Link>

        {item.has_lab && item.lab_id && (
          <Link
            href={`/labs/${item.lab_id}`}
            className="inline-flex items-center border border-stellar-green text-stellar-green hover:bg-stellar-green/10 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            运行实验
          </Link>
        )}

        <Link
          href="/docs/tech-comparisons"
          className="inline-flex items-center border border-cosmos-border text-cosmos-dim hover:text-cosmos-text px-4 py-2 rounded-lg font-medium transition-colors"
        >
          查看技术对比
        </Link>
      </div>
    </div>
  );
}
