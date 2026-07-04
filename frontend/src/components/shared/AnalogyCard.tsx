export function AnalogyCard({ analogy, oneLiner }: { analogy: string; oneLiner: string }) {
  return (
    <div className="glass-card p-4 my-4 border-l-2 border-l-stellar-violet">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">💡</span>
        <div>
          <p className="text-sm font-semibold text-cosmos-text mb-1">{oneLiner}</p>
          <p className="text-xs text-cosmos-dim leading-relaxed">{analogy}</p>
        </div>
      </div>
    </div>
  );
}
