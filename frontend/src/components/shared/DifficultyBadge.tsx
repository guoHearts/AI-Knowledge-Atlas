import { Difficulty, DIFFICULTY_COLORS } from '@/types/learning';

const FALLBACK_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function DifficultyBadge({
  difficulty,
  label,
  size = 'sm',
}: {
  difficulty: Difficulty;
  label?: string;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[10px]';
  return (
    <span className={`difficulty-badge ${DIFFICULTY_COLORS[difficulty]} ${sizeClasses}`}>
      {label || FALLBACK_LABELS[difficulty]}
    </span>
  );
}
