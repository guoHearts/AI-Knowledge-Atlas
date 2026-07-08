import type { Lesson } from '@/features/learn/types/learning';

export function DesignInsight({ lesson }: { lesson: Lesson }) {
  if (!lesson.designPatternId) return null;

  return (
    <div className="glass-card p-5 my-6 border-l-2 border-l-stellar-violet">
      <h3 className="text-sm font-bold text-cosmos-text mb-2">🧠 设计洞察</h3>
      <p className="text-xs text-cosmos-dim leading-relaxed">
        本课时关联的设计模式 ID: {lesson.designPatternId}。它采用了什么模式？为什么这样设计？
        如果不用这个方案，还有什么替代方案？
      </p>
    </div>
  );
}
