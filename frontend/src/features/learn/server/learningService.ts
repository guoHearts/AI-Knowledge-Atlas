import type Database from 'better-sqlite3';
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

type LearningDatabase = Pick<Database.Database, 'prepare'>;

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

export function listPublishedTrackRows(db: LearningDatabase): LearningTrackRow[] {
  return db.prepare(
    "SELECT * FROM learning_tracks WHERE status = 'published' ORDER BY sort_order",
  ).all() as LearningTrackRow[];
}

export function getTrackRowWithModuleRows(
  db: LearningDatabase,
  slug: string,
): TrackRowWithModuleRows | null {
  const track = db.prepare('SELECT * FROM learning_tracks WHERE slug = ?')
    .get(slug) as LearningTrackRow | undefined;
  if (!track) return null;

  const modules = db.prepare(
    'SELECT * FROM modules WHERE track_id = ? ORDER BY sort_order',
  ).all(track.id) as ModuleRow[];

  return { ...track, modules };
}

export function getModuleRowWithLessonRows(
  db: LearningDatabase,
  id: string,
): ModuleRowWithLessonRows | null {
  const moduleRow = db.prepare('SELECT * FROM modules WHERE id = ?')
    .get(id) as ModuleRow | undefined;
  if (!moduleRow) return null;

  const lessons = db.prepare(
    "SELECT * FROM lessons WHERE module_id = ? AND status = 'published' ORDER BY sort_order",
  ).all(id) as LessonRow[];

  return { ...moduleRow, lessons };
}

export function getLessonRow(db: LearningDatabase, id: string): LessonRow | null {
  return db.prepare('SELECT * FROM lessons WHERE id = ?')
    .get(id) as LessonRow | undefined || null;
}

export function listDesignPatternRows(db: LearningDatabase): DesignPatternRow[] {
  return db.prepare('SELECT * FROM design_patterns ORDER BY category')
    .all() as DesignPatternRow[];
}

export function getDesignPatternRow(
  db: LearningDatabase,
  id: string,
): DesignPatternRow | null {
  return db.prepare('SELECT * FROM design_patterns WHERE id = ? OR name = ?')
    .get(id, id) as DesignPatternRow | undefined || null;
}

export function getTrackPageData(
  db: LearningDatabase,
  slug: string,
  userId = 'default',
): TrackPageData | null {
  const trackRow = db.prepare(
    'SELECT * FROM learning_tracks WHERE slug = ? AND status = ?',
  ).get(slug, 'published') as LearningTrackRow | undefined;
  if (!trackRow) return null;

  const track = toTrack(trackRow);
  const moduleRows = db.prepare(
    'SELECT * FROM modules WHERE track_id = ? AND status = ? ORDER BY sort_order',
  ).all(track.id, 'published') as ModuleRow[];
  const modules = moduleRows.map(toModule);

  const allLessons = modules.flatMap((moduleRow) => {
    const lessonRows = db.prepare(
      'SELECT * FROM lessons WHERE module_id = ? AND status = ? ORDER BY sort_order',
    ).all(moduleRow.id, 'published') as LessonRow[];

    return lessonRows.map((lessonRow) => {
      const lesson = toLesson(lessonRow);
      const progressRow = db.prepare(
        'SELECT * FROM user_progress WHERE lesson_id = ? AND user_id = ?',
      ).get(lesson.id, userId) as UserProgressRow | undefined;

      return {
        lesson,
        progress: progressRow ? toUserProgress(progressRow) : undefined,
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

export function getLessonPageData(
  db: LearningDatabase,
  params: {
    trackSlug: string;
    moduleId: string;
    lessonSlug: string;
    userId?: string;
  },
): LessonPageData | null {
  const userId = params.userId || 'default';
  const trackRow = db.prepare('SELECT * FROM learning_tracks WHERE slug = ?')
    .get(params.trackSlug) as LearningTrackRow | undefined;
  if (!trackRow) return null;
  const track = toTrack(trackRow);

  const moduleRow = db.prepare('SELECT * FROM modules WHERE id = ? AND track_id = ?')
    .get(params.moduleId, track.id) as ModuleRow | undefined;
  if (!moduleRow) return null;
  const moduleData = toModule(moduleRow);

  const lessonRow = db.prepare('SELECT * FROM lessons WHERE slug = ? AND module_id = ?')
    .get(params.lessonSlug, params.moduleId) as LessonRow | undefined;
  if (!lessonRow) return null;
  const lesson = toLesson(lessonRow);

  const progressRow = db.prepare('SELECT * FROM user_progress WHERE lesson_id = ? AND user_id = ?')
    .get(lesson.id, userId) as UserProgressRow | undefined;
  const progress = progressRow ? toUserProgress(progressRow) : undefined;

  const allModuleLessonRows = db.prepare(
    'SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order',
  ).all(params.moduleId) as LessonRow[];
  const allModuleLessons = allModuleLessonRows.map(toLesson);
  const currentLessonIndex = allModuleLessons.findIndex((item) => item.id === lesson.id);
  const prevLesson = currentLessonIndex > 0 ? allModuleLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allModuleLessons.length - 1
    ? allModuleLessons[currentLessonIndex + 1]
    : null;

  const allModuleRows = db.prepare(
    'SELECT * FROM modules WHERE track_id = ? ORDER BY sort_order',
  ).all(track.id) as ModuleRow[];
  const allModules = allModuleRows.map(toModule);
  const currentModuleIndex = allModules.findIndex((item) => item.id === params.moduleId);

  const prevModuleLastLessonRow = currentModuleIndex > 0
    ? db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order DESC LIMIT 1')
      .get(allModules[currentModuleIndex - 1].id) as LessonRow | undefined
    : undefined;
  const prevModuleLastLesson = prevModuleLastLessonRow ? toLesson(prevModuleLastLessonRow) : null;

  const nextModuleFirstLessonRow = currentModuleIndex < allModules.length - 1
    ? db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order ASC LIMIT 1')
      .get(allModules[currentModuleIndex + 1].id) as LessonRow | undefined
    : undefined;
  const nextModuleFirstLesson = nextModuleFirstLessonRow ? toLesson(nextModuleFirstLessonRow) : null;

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
              title: prevModuleLastLesson.title,
              href: `/learn/${params.trackSlug}/${allModules[currentModuleIndex - 1].id}/${prevModuleLastLesson.slug}`,
            }
          : null,
      next: nextLesson
        ? { title: nextLesson.title, href: `/learn/${params.trackSlug}/${params.moduleId}/${nextLesson.slug}` }
        : nextModuleFirstLesson
          ? {
              title: nextModuleFirstLesson.title,
              href: `/learn/${params.trackSlug}/${allModules[currentModuleIndex + 1].id}/${nextModuleFirstLesson.slug}`,
            }
          : null,
    },
  };
}
