import { getBackendInternalUrl } from '../../../lib/env';
import { ApiError, request } from '../../../lib/request';
import type {
  LearningTrack,
  DesignPatternRow,
  Lesson,
  LearningTrackRow,
  LessonRow,
  Module,
  ModuleRow,
  UserProgress,
  UserProgressRow,
} from '../../../types/learning';
import {
  toLesson,
  toModule,
  toTrack,
  toUserProgress,
} from '../../../types/learning';

export type TrackRowWithModuleRows = LearningTrackRow & {
  modules: ModuleRow[];
};

export type ModuleRowWithLessonRows = ModuleRow & {
  lessons: LessonRow[];
};

export type LessonWithProgress = {
  lesson: Lesson;
  progress?: UserProgress;
};

export type TrackPageData = {
  track: LearningTrack;
  modules: Module[];
  allLessons: LessonWithProgress[];
  completedCount: number;
  overallPercent: number;
};

export type LessonNavigationItem = {
  title: string;
  href: string;
};

export type LessonPageData = {
  track: LearningTrack;
  module: Module;
  lesson: Lesson;
  progress?: UserProgress;
  navigation: {
    prev: LessonNavigationItem | null;
    next: LessonNavigationItem | null;
  };
};

function learningUrl(path: string): string {
  return `${getBackendInternalUrl()}/learning${path}`;
}

async function requestOrNull<T>(url: string): Promise<T | null> {
  try {
    return await request<T>(url);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function listPublishedTrackRows(): Promise<LearningTrackRow[]> {
  return request<LearningTrackRow[]>(learningUrl('/tracks'));
}

export function getTrackRowWithModuleRows(
  slug: string,
): Promise<TrackRowWithModuleRows | null> {
  return requestOrNull<TrackRowWithModuleRows>(
    learningUrl(`/tracks/${encodeURIComponent(slug)}`),
  );
}

export function getModuleRowWithLessonRows(
  id: string,
): Promise<ModuleRowWithLessonRows | null> {
  return requestOrNull<ModuleRowWithLessonRows>(
    learningUrl(`/modules/${encodeURIComponent(id)}`),
  );
}

export function getLessonRow(id: string): Promise<LessonRow | null> {
  return requestOrNull<LessonRow>(
    learningUrl(`/lessons/${encodeURIComponent(id)}`),
  );
}

export function listDesignPatternRows(): Promise<DesignPatternRow[]> {
  return request<DesignPatternRow[]>(learningUrl('/design-patterns'));
}

export function getDesignPatternRow(id: string): Promise<DesignPatternRow | null> {
  return requestOrNull<DesignPatternRow>(
    learningUrl(`/design-patterns/${encodeURIComponent(id)}`),
  );
}

export async function getTrackPageData(
  slug: string,
  userId = 'default',
): Promise<TrackPageData | null> {
  const trackRow = await getTrackRowWithModuleRows(slug);
  if (!trackRow || trackRow.status !== 'published') return null;

  const track = toTrack(trackRow);
  const moduleRows = trackRow.modules.filter((moduleRow) => moduleRow.status === 'published');
  const modules = moduleRows.map(toModule);
  const progressRows = await request<UserProgressRow[]>(
    learningUrl(`/progress?${new URLSearchParams({ userId }).toString()}`),
  );
  const progressByLessonId = new Map(
    progressRows.map((row) => [row.lesson_id, toUserProgress(row)]),
  );

  const moduleWithLessons = await Promise.all(
    modules.map((moduleRow) => getModuleRowWithLessonRows(moduleRow.id)),
  );
  const allLessons = moduleWithLessons.flatMap((moduleData) => {
    if (!moduleData) return [];

    return moduleData.lessons
      .filter((lessonRow) => lessonRow.status === 'published')
      .map((lessonRow) => {
        const lesson = toLesson(lessonRow);
        return {
          lesson,
          progress: progressByLessonId.get(lesson.id),
        };
      });
  });

  const completedCount = allLessons.filter((item) => item.progress?.status === 'completed').length;
  const overallPercent = allLessons.length > 0
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  return {
    track,
    modules,
    allLessons,
    completedCount,
    overallPercent,
  };
}

export async function getLessonPageData(params: {
  trackSlug: string;
  moduleId: string;
  lessonSlug: string;
  userId?: string;
}): Promise<LessonPageData | null> {
  const userId = params.userId || 'default';
  const trackRow = await getTrackRowWithModuleRows(params.trackSlug);
  if (!trackRow) return null;
  const track = toTrack(trackRow);

  const moduleRow = await getModuleRowWithLessonRows(params.moduleId);
  if (!moduleRow || moduleRow.track_id !== track.id) return null;
  const moduleData = toModule(moduleRow);

  const lessons = moduleRow.lessons
    .filter((lessonRow) => lessonRow.status === 'published')
    .map(toLesson);
  const lesson = lessons.find((item) => item.slug === params.lessonSlug);
  if (!lesson) return null;

  const progressRows = await request<UserProgressRow[]>(
    learningUrl(`/progress?${new URLSearchParams({ userId }).toString()}`),
  );
  const progressRow = progressRows.find((item) => item.lesson_id === lesson.id);
  const progress = progressRow ? toUserProgress(progressRow) : undefined;

  const currentLessonIndex = lessons.findIndex((item) => item.id === lesson.id);
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < lessons.length - 1
    ? lessons[currentLessonIndex + 1]
    : null;

  const allModules = trackRow.modules
    .filter((item) => item.status === 'published')
    .map(toModule);
  const currentModuleIndex = allModules.findIndex((item) => item.id === params.moduleId);
  const prevModuleLastLesson = await getAdjacentModuleLesson(
    allModules[currentModuleIndex - 1],
    'last',
  );
  const nextModuleFirstLesson = await getAdjacentModuleLesson(
    allModules[currentModuleIndex + 1],
    'first',
  );

  return {
    track,
    module: moduleData,
    lesson,
    progress,
    navigation: {
      prev: prevLesson
        ? { title: prevLesson.title, href: `/learn/${params.trackSlug}/${params.moduleId}/${prevLesson.slug}` }
        : prevModuleLastLesson
          ? {
              title: prevModuleLastLesson.lesson.title,
              href: `/learn/${params.trackSlug}/${prevModuleLastLesson.moduleId}/${prevModuleLastLesson.lesson.slug}`,
            }
          : null,
      next: nextLesson
        ? { title: nextLesson.title, href: `/learn/${params.trackSlug}/${params.moduleId}/${nextLesson.slug}` }
        : nextModuleFirstLesson
          ? {
              title: nextModuleFirstLesson.lesson.title,
              href: `/learn/${params.trackSlug}/${nextModuleFirstLesson.moduleId}/${nextModuleFirstLesson.lesson.slug}`,
            }
          : null,
    },
  };
}

async function getAdjacentModuleLesson(
  moduleData: Module | undefined,
  edge: 'first' | 'last',
): Promise<{ moduleId: string; lesson: Lesson } | null> {
  if (!moduleData) return null;

  const moduleRow = await getModuleRowWithLessonRows(moduleData.id);
  const lessons = (moduleRow?.lessons || [])
    .filter((lessonRow) => lessonRow.status === 'published')
    .map(toLesson);
  const lesson = edge === 'first' ? lessons[0] : lessons[lessons.length - 1];
  return lesson ? { moduleId: moduleData.id, lesson } : null;
}
