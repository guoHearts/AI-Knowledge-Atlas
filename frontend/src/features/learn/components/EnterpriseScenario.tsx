import type { Lesson } from '@/features/learn/types/learning';

export function EnterpriseScenario({ lesson }: { lesson: Lesson }) {
  if (!lesson.tags.includes('实战') && !lesson.tags.includes('生产') && !lesson.tags.includes('生产级')) return null;

  return (
    <div className="glass-card p-5 my-6 border-l-2 border-l-stellar-amber">
      <h3 className="text-sm font-bold text-cosmos-text mb-2">🏢 企业场景</h3>
      <div className="space-y-2 text-xs text-cosmos-dim">
        <p>📌 <strong>这个技术在企业里通常用于：</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Agent 系统的工具集成</li>
          <li>企业级 API 标准化</li>
          <li>跨系统连通</li>
        </ul>
        <p className="mt-2">💼 <strong>面试会怎么问：</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2 text-stellar-violet/80">
          <li>请描述你在项目中如何使用该技术</li>
          <li>该技术的核心设计模式是什么？</li>
        </ul>
      </div>
    </div>
  );
}
