export function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border border-stellar-blue/20 animate-ping" />
        <div
          className="absolute inset-2 rounded-full border border-stellar-blue/30"
          style={{ animation: 'pulse-ring 1.8s ease-out infinite' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-stellar-blue shadow-[0_0_12px_rgba(91,156,245,0.5)]" />
        </div>
      </div>
      <p className="text-cosmos-dim text-sm font-body">{text}</p>
    </div>
  );
}
