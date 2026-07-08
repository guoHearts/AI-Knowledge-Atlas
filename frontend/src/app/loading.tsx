export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 animate-pulse rounded-full bg-stellar-blue" />
        <span className="h-3 w-3 animate-pulse rounded-full bg-stellar-violet" style={{ animationDelay: '150ms' }} />
        <span className="h-3 w-3 animate-pulse rounded-full bg-stellar-emerald" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="text-sm text-cosmos-dim">加载中...</p>
    </div>
  );
}
