import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import type {
  LessonRow, ModuleRow, LearningTrackRow, UserProgressRow, ExperimentConfig,
} from '@/types/learning';
import { toTrack, toModule, toLesson, toUserProgress } from '@/types/learning';
import { LessonPlayerClient } from '@/components/learn/LessonPlayerClient';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ track: string; module: string; lesson: string }>;
}) {
  const { track: trackSlug, module: moduleId, lesson: lessonSlug } = await params;

  const db = getDb();

  const trackRow = db.prepare('SELECT * FROM learning_tracks WHERE slug = ?').get(trackSlug) as LearningTrackRow | undefined;
  if (!trackRow) notFound();
  const track = toTrack(trackRow);

  const modRow = db.prepare('SELECT * FROM modules WHERE id = ? AND track_id = ?').get(moduleId, track.id) as ModuleRow | undefined;
  if (!modRow) notFound();
  const mod = toModule(modRow);

  const lessonRow = db.prepare('SELECT * FROM lessons WHERE slug = ? AND module_id = ?')
    .get(lessonSlug, moduleId) as LessonRow | undefined;
  if (!lessonRow) notFound();
  const lesson = toLesson(lessonRow);

  // Get progress
  const progressRow = db.prepare('SELECT * FROM user_progress WHERE lesson_id = ? AND user_id = ?')
    .get(lesson.id, 'default') as UserProgressRow | undefined;
  const progress = progressRow ? toUserProgress(progressRow) : undefined;

  // Get previous and next lessons (as rows, then transform)
  const allModuleLessonRows = db.prepare(
    'SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order'
  ).all(moduleId) as LessonRow[];
  const allModuleLessons = allModuleLessonRows.map(toLesson);

  const currentIdx = allModuleLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? allModuleLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allModuleLessons.length - 1 ? allModuleLessons[currentIdx + 1] : null;

  // Get all modules for cross-module navigation
  const allModuleRows = db.prepare(
    'SELECT * FROM modules WHERE track_id = ? ORDER BY sort_order'
  ).all(track.id) as ModuleRow[];
  const allModules = allModuleRows.map(toModule);

  const currentModuleIdx = allModules.findIndex(m => m.id === moduleId);
  const prevModuleLastLessonRow = currentModuleIdx > 0
    ? db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order DESC LIMIT 1').get(allModules[currentModuleIdx - 1].id) as LessonRow | undefined
    : null;
  const prevModuleLastLesson = prevModuleLastLessonRow ? toLesson(prevModuleLastLessonRow) : null;

  const nextModuleFirstLessonRow = currentModuleIdx < allModules.length - 1
    ? db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order ASC LIMIT 1').get(allModules[currentModuleIdx + 1].id) as LessonRow | undefined
    : null;
  const nextModuleFirstLesson = nextModuleFirstLessonRow ? toLesson(nextModuleFirstLessonRow) : null;

  // Load MDX content
  let mdxContent = '';
  if (lesson.contentPath) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const contentPath = path.join(process.cwd(), 'content', lesson.contentPath);
      mdxContent = await fs.readFile(contentPath, 'utf-8');
    } catch {
      mdxContent = `# ${lesson.title}\n\n> 内容正在编写中...\n\n${lesson.analogy ? `💡 **${lesson.analogy}**\n\n_${lesson.oneLiner}_` : ''}`;
    }
  }

  const navigation = {
    prev: prevLesson
      ? { title: prevLesson.title, href: `/learn/${trackSlug}/${moduleId}/${prevLesson.slug}` }
      : prevModuleLastLesson
        ? { title: prevModuleLastLesson.title, href: `/learn/${trackSlug}/${allModules[currentModuleIdx - 1].id}/${prevModuleLastLesson.slug}` }
        : null,
    next: nextLesson
      ? { title: nextLesson.title, href: `/learn/${trackSlug}/${moduleId}/${nextLesson.slug}` }
      : nextModuleFirstLesson
        ? { title: nextModuleFirstLesson.title, href: `/learn/${trackSlug}/${allModules[currentModuleIdx + 1].id}/${nextModuleFirstLesson.slug}` }
        : null,
  };

  return (
    <LessonPlayerClient
      track={track}
      module={mod}
      lesson={lesson}
      progress={progress}
      mdxContent={mdxContent}
      navigation={navigation}
    />
  );
}
