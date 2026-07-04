import { Difficulty, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types/learning';

export function DifficultyBadge({ difficulty, size = 'sm' }: { difficulty: Difficulty; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[10px]';
  return (
    <span className={`difficulty-badge ${DIFFICULTY_COLORS[difficulty]} ${sizeClasses}`}>
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}
