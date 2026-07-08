import { notFound } from 'next/navigation';
import { getLessonPageData } from '@/features/learn/server/learningService';
import { LessonPlayerClient } from '@/components/learn/LessonPlayerClient';

export const dynamic = 'force-dynamic';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ track: string; module: string; lesson: string }>;
}) {
  const { track: trackSlug, module: moduleId, lesson: lessonSlug } = await params;

  const pageData = await getLessonPageData({ trackSlug, moduleId, lessonSlug });
  if (!pageData) notFound();
  const { track, module: mod, lesson, progress, navigation } = pageData;

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
