export function ProgressBar({ percent, size = 'sm' }: { percent: number; size?: 'sm' | 'md' }) {
  const h = size === 'md' ? 'h-2.5' : 'h-2';
  return (
    <div className={`w-full bg-cosmos-text/10 rounded-full ${h} overflow-hidden border border-cosmos-text/5`}>
      <div
        className={`${h} bg-[linear-gradient(90deg,#2358d8,#0e8f72)] rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
