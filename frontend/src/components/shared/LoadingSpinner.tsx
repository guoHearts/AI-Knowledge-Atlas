export function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-4 h-14 w-14 rounded-full border border-cosmos-border bg-cosmos-surface shadow-sm">
        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-stellar-blue/20 border-t-stellar-blue animate-spin" />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stellar-emerald" />
      </div>
      <p className="text-cosmos-dim text-sm">{text}</p>
    </div>
  );
}
