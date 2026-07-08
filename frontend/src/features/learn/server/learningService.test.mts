import test from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';

import {
  getDesignPatternRow,
  getLessonRow,
  getLessonPageData,
  getModuleRowWithLessonRows,
  getTrackPageData,
  getTrackRowWithModuleRows,
  listDesignPatternRows,
  listPublishedTrackRows,
} from './learningService.ts';

function createLearningDb() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE learning_tracks (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      difficulty TEXT NOT NULL DEFAULT 'beginner',
      estimated_hours INTEGER,
      prerequisites TEXT,
      outcome_skills TEXT,
      outcome_project TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT '',
      updated_at TEXT DEFAULT ''
    );

    CREATE TABLE modules (
      id TEXT PRIMARY KEY,
      track_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      stage INTEGER NOT NULL,
      sort_order INTEGER NOT NULL,
      estimated_hours INTEGER,
      difficulty TEXT DEFAULT 'beginner',
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT '',
      updated_at TEXT DEFAULT ''
    );

    CREATE TABLE lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      content_path TEXT,
      sort_order INTEGER NOT NULL,
      difficulty TEXT DEFAULT 'beginner',
      estimated_minutes INTEGER DEFAULT 45,
      analogy TEXT,
      one_liner TEXT,
      experiment_config TEXT,
      design_pattern_id TEXT,
      graph_node_ids TEXT,
      tags TEXT,
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT '',
      updated_at TEXT DEFAULT ''
    );

    CREATE TABLE design_patterns (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      motivation TEXT,
      structure_diagram TEXT,
      implementation_guide TEXT,
      code_example_langchain TEXT,
      code_example_anthropic TEXT,
      tradeoffs TEXT,
      when_to_use TEXT,
      when_not_to_use TEXT,
      related_pattern_ids TEXT,
      related_graph_nodes TEXT,
      enterprise_scenario TEXT,
      interview_questions TEXT,
      created_at TEXT DEFAULT '',
      updated_at TEXT DEFAULT ''
    );

    CREATE TABLE user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      lesson_id TEXT NOT NULL,
      status TEXT DEFAULT 'not_started',
      experiment_status TEXT,
      experiment_code TEXT,
      notes TEXT,
      started_at TEXT,
      completed_at TEXT,
      time_spent_seconds INTEGER DEFAULT 0,
      UNIQUE(user_id, lesson_id)
    );
  `);

  db.prepare(`
    INSERT INTO learning_tracks (
      id, slug, title, difficulty, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('track-1', 'agent-engineer', 'Agent Engineer', 'beginner', 1, 'published', 'now', 'now');
  db.prepare(`
    INSERT INTO learning_tracks (
      id, slug, title, difficulty, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('track-draft', 'draft-track', 'Draft Track', 'beginner', 2, 'draft', 'now', 'now');

  db.prepare(`
    INSERT INTO modules (
      id, track_id, title, stage, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('module-1', 'track-1', 'MCP', 1, 1, 'published', 'now', 'now');
  db.prepare(`
    INSERT INTO modules (
      id, track_id, title, stage, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('module-draft', 'track-1', 'Draft Module', 1, 2, 'draft', 'now', 'now');
  db.prepare(`
    INSERT INTO modules (
      id, track_id, title, stage, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('module-2', 'track-1', 'Production', 2, 3, 'published', 'now', 'now');

  db.prepare(`
    INSERT INTO lessons (
      id, module_id, title, slug, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('lesson-1', 'module-1', 'Protocol', 'protocol', 1, 'published', 'now', 'now');
  db.prepare(`
    INSERT INTO lessons (
      id, module_id, title, slug, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('lesson-2', 'module-1', 'Client', 'client', 2, 'published', 'now', 'now');
  db.prepare(`
    INSERT INTO lessons (
      id, module_id, title, slug, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('lesson-draft', 'module-1', 'Draft Lesson', 'draft', 2, 'draft', 'now', 'now');
  db.prepare(`
    INSERT INTO lessons (
      id, module_id, title, slug, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('lesson-3', 'module-2', 'Deploy', 'deploy', 1, 'published', 'now', 'now');

  db.prepare(`
    INSERT INTO design_patterns (
      id, name, title, category, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run('router', 'router', 'Router Pattern', 'orchestration', 'now', 'now');

  db.prepare(`
    INSERT INTO user_progress (id, user_id, lesson_id, status)
    VALUES (?, ?, ?, ?)
  `).run('progress-1', 'default', 'lesson-1', 'completed');

  return db;
}

test('listPublishedTrackRows returns only published tracks ordered by sort order', () => {
  const db = createLearningDb();

  const tracks = listPublishedTrackRows(db);

  assert.deepEqual(tracks.map((track) => track.slug), ['agent-engineer']);
  db.close();
});

test('getTrackRowWithModuleRows keeps the legacy route shape with modules', () => {
  const db = createLearningDb();

  const track = getTrackRowWithModuleRows(db, 'agent-engineer');

  assert.equal(track?.slug, 'agent-engineer');
  assert.deepEqual(track?.modules.map((moduleRow) => moduleRow.id), ['module-1', 'module-draft', 'module-2']);
  db.close();
});

test('getModuleRowWithLessonRows returns published lessons for the module route', () => {
  const db = createLearningDb();

  const moduleWithLessons = getModuleRowWithLessonRows(db, 'module-1');

  assert.equal(moduleWithLessons?.id, 'module-1');
  assert.deepEqual(moduleWithLessons?.lessons.map((lesson) => lesson.id), ['lesson-1', 'lesson-2']);
  db.close();
});

test('getLessonRow and design pattern helpers return existing rows or null', () => {
  const db = createLearningDb();

  assert.equal(getLessonRow(db, 'lesson-1')?.slug, 'protocol');
  assert.equal(getLessonRow(db, 'missing'), null);
  assert.deepEqual(listDesignPatternRows(db).map((pattern) => pattern.name), ['router']);
  assert.equal(getDesignPatternRow(db, 'router')?.title, 'Router Pattern');
  assert.equal(getDesignPatternRow(db, 'missing'), null);
  db.close();
});

test('getTrackPageData maps published modules, lessons, progress, and completion percent', () => {
  const db = createLearningDb();

  const data = getTrackPageData(db, 'agent-engineer');

  assert.equal(data?.track.slug, 'agent-engineer');
  assert.deepEqual(data?.modules.map((moduleRow) => moduleRow.id), ['module-1', 'module-2']);
  assert.deepEqual(data?.allLessons.map((item) => item.lesson.id), ['lesson-1', 'lesson-2', 'lesson-3']);
  assert.equal(data?.completedCount, 1);
  assert.equal(data?.overallPercent, 33);
  db.close();
});

test('getLessonPageData maps lesson dependencies and same-module navigation', () => {
  const db = createLearningDb();

  const data = getLessonPageData(db, {
    trackSlug: 'agent-engineer',
    moduleId: 'module-1',
    lessonSlug: 'protocol',
  });

  assert.equal(data?.track.slug, 'agent-engineer');
  assert.equal(data?.module.id, 'module-1');
  assert.equal(data?.lesson.id, 'lesson-1');
  assert.equal(data?.progress?.id, 'progress-1');
  assert.equal(data?.navigation.prev, null);
  assert.deepEqual(data?.navigation.next, {
    title: 'Client',
    href: '/learn/agent-engineer/module-1/client',
  });
  db.close();
});

test('getLessonPageData preserves existing same-module lesson ordering', () => {
  const db = createLearningDb();

  const data = getLessonPageData(db, {
    trackSlug: 'agent-engineer',
    moduleId: 'module-1',
    lessonSlug: 'client',
  });

  assert.deepEqual(data?.navigation.next, {
    title: 'Draft Lesson',
    href: '/learn/agent-engineer/module-1/draft',
  });
  db.close();
});
