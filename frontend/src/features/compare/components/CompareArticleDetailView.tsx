import Link from 'next/link';
import type { CompareArticle } from '../types/compare.types';
import { getStatusColor } from './CompareArticleCard';
import { translateStatus } from '@/lib/contentLabels';

interface CompareArticleDetailViewProps {
  article: CompareArticle;
  locale: string;
}

export function CompareArticleDetailView({ article, locale }: CompareArticleDetailViewProps) {
  const contenderNames = article.contenders.map((contender) => contender.name);
  const hasRelated =
    article.related_lab_ids.length > 0 ||
    article.related_radar_item_ids.length > 0 ||
    article.related_node_ids.length > 0 ||
    article.related_learning_paths.length > 0;

  return (
    <div className="bg-cosmos-surface rounded-lg p-8 border border-cosmos-border">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/30 bg-indigo-500/20 text-indigo-700">
          技术选型
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(article.status)}`}>
          {translateStatus(article.status, locale)}
        </span>
        <span className="text-cosmos-dim text-sm">
          最后验证: {new Date(article.last_verified_at).toLocaleDateString()}
        </span>
      </div>

      <h1 className="font-display text-3xl font-bold leading-tight text-cosmos-text mb-6">
        {article.title}
      </h1>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-cosmos-text mb-3">一句话结论</h2>
          <p className="text-lg text-cosmos-dim leading-relaxed">{article.summary}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cosmos-text mb-3">对比对象</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {article.contenders.map((contender) => (
              <div key={contender.name} className="rounded-lg border border-cosmos-border p-4">
                <h3 className="font-semibold text-cosmos-text">{contender.name}</h3>
                {contender.vendor && (
                  <p className="mt-1 text-xs text-cosmos-dim">{contender.vendor}</p>
                )}
                {contender.latest_version && (
                  <p className="mt-1 font-mono text-xs text-cosmos-dim">{contender.latest_version}</p>
                )}
                <p className="mt-2 text-sm leading-6 text-cosmos-dim">{contender.one_liner}</p>
              </div>
            ))}
          </div>
        </section>

        {article.dimensions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-cosmos-text mb-3">功能与工程能力矩阵</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-cosmos-border">
                    <th className="py-2 pr-4 text-left font-medium text-cosmos-text">维度</th>
                    {contenderNames.map((name) => (
                      <th key={name} className="py-2 px-4 text-left font-medium text-cosmos-text">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {article.dimensions.map((dimension) => (
                    <tr key={dimension.name} className="border-b border-cosmos-border/60">
                      <td className="py-2 pr-4 font-medium text-cosmos-text align-top">
                        {dimension.name}
                      </td>
                      {contenderNames.map((name) => (
                        <td key={name} className="py-2 px-4 text-cosmos-dim align-top">
                          {dimension.values[name] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {article.use_when.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-cosmos-text mb-3">典型适用场景</h2>
              <ul className="space-y-3">
                {article.use_when.map((scenario) => (
                  <li key={`${scenario.contender}-${scenario.scenario}`} className="text-sm leading-6 text-cosmos-dim">
                    <span className="font-medium text-cosmos-text">{scenario.contender}：</span>
                    {scenario.scenario}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {article.avoid_when.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-cosmos-text mb-3">不适用场景</h2>
              <ul className="space-y-3">
                {article.avoid_when.map((scenario) => (
                  <li key={`${scenario.contender}-${scenario.scenario}`} className="text-sm leading-6 text-cosmos-dim">
                    <span className="font-medium text-cosmos-text">{scenario.contender}：</span>
                    {scenario.scenario}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {article.decision_tree.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-cosmos-text mb-3">决策树</h2>
            <div className="space-y-3">
              {article.decision_tree.map((decision) => (
                <div
                  key={decision.condition}
                  className="rounded-lg border border-cosmos-border p-4 md:flex md:items-center md:gap-4"
                >
                  <p className="text-sm text-cosmos-dim md:flex-1">
                    <span className="text-cosmos-dim">如果</span>{' '}
                    <span className="text-cosmos-text">{decision.condition}</span>
                  </p>
                  <p className="mt-2 text-sm font-medium text-stellar-green md:mt-0">
                    → {decision.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {article.cost_notes.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-cosmos-text mb-3">学习、迁移与部署成本</h2>
            <ul className="space-y-2 text-sm leading-6 text-cosmos-dim">
              {article.cost_notes.map((note) => (
                <li key={note}>- {note}</li>
              ))}
            </ul>
          </section>
        )}

        {article.sources.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-cosmos-text mb-3">官方来源</h2>
            <ul className="space-y-2 text-sm leading-6">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stellar-green hover:text-stellar-green/80"
                  >
                    {source.title}
                  </a>
                  <span className="ml-2 text-cosmos-dim">
                    ({source.type === 'official' ? '官方' : source.type})
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasRelated && (
          <section>
            <h2 className="text-xl font-semibold text-cosmos-text mb-3">相关路径</h2>
            <div className="grid gap-3 text-sm md:grid-cols-3">
              {article.related_lab_ids.map((labId) => (
                <Link
                  key={labId}
                  href={`/labs/${labId}`}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  实验: {labId}
                </Link>
              ))}
              {article.related_radar_item_ids.map((radarId) => (
                <Link
                  key={radarId}
                  href={`/radar/${radarId}`}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  雷达: {radarId}
                </Link>
              ))}
              {article.related_node_ids.map((nodeId) => (
                <Link
                  key={nodeId}
                  href={`/graph?node=${encodeURIComponent(nodeId)}`}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  图谱: {nodeId}
                </Link>
              ))}
              {article.related_learning_paths.map((path) => (
                <Link
                  key={path}
                  href={path}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  课程: {path.split('/').pop()}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
