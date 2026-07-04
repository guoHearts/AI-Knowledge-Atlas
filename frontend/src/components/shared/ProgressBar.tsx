export function ProgressBar({ percent, size = 'sm' }: { percent: number; size?: 'sm' | 'md' }) {
  const h = size === 'md' ? 'h-2' : 'h-1.5';
  return (
    <div className={`w-full bg-cosmos-bg rounded-full ${h} overflow-hidden`}>
      <div
        className={`${h} bg-gradient-to-r from-stellar-blue to-stellar-violet rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
