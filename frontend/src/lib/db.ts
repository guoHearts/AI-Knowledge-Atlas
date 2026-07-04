import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'learning.db');

let db: Database.Database | null = null;
let seeded = false;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }

  // Lazy seed on first access — check if tracks table is empty
  if (!seeded) {
    seeded = true;
    try {
      const count = db!.prepare('SELECT COUNT(*) as cnt FROM learning_tracks').get() as { cnt: number };
      if (count.cnt === 0) {
        // Use require to avoid circular import issues
        const { seedDatabase } = require('./seed');
        seedDatabase();
      } else {
        const { ensureLatestCurriculum } = require('./seed');
        ensureLatestCurriculum();
      }
    } catch (e) {
      console.warn('[db] Seed check failed:', (e as Error).message);
    }
  }

  return db;
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS learning_tracks (
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      track_id TEXT NOT NULL REFERENCES learning_tracks(id),
      title TEXT NOT NULL,
      description TEXT,
      stage INTEGER NOT NULL,
      sort_order INTEGER NOT NULL,
      estimated_hours INTEGER,
      difficulty TEXT DEFAULT 'beginner',
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL REFERENCES modules(id),
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(module_id, slug)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      lesson_id TEXT NOT NULL REFERENCES lessons(id),
      status TEXT DEFAULT 'not_started',
      experiment_status TEXT,
      experiment_code TEXT,
      notes TEXT,
      started_at TEXT,
      completed_at TEXT,
      time_spent_seconds INTEGER DEFAULT 0,
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS design_patterns (
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      lesson_id TEXT REFERENCES lessons(id),
      content TEXT NOT NULL,
      graph_node_ids TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS experiment_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      lesson_id TEXT NOT NULL REFERENCES lessons(id),
      code TEXT NOT NULL,
      output TEXT,
      status TEXT DEFAULT 'pending',
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// Re-export for convenience
export { Database };
