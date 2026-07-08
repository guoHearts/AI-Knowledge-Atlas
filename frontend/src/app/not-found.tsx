import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="rounded-full border border-cosmos-border bg-cosmos-surface px-4 py-1.5">
        <span className="font-mono text-xs font-bold text-cosmos-dim">
          404
        </span>
      </div>
      <h2 className="font-display text-2xl font-bold text-cosmos-text">
        页面不存在
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-cosmos-dim">
        你访问的页面可能已被移动、删除或尚未创建。
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">
          返回首页
        </Link>
        <Link href="/graph" className="btn-ghost">
          探索图谱
        </Link>
      </div>
    </div>
  );
}
