"""Migrate legacy learning SQLite data into backend-owned PostgreSQL."""

from __future__ import annotations

import os
import sqlite3
from collections.abc import Iterable
from pathlib import Path
from typing import Any

import psycopg
from psycopg.rows import dict_row


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SQLITE_PATH = ROOT / "frontend" / "data" / "learning.db"
DEFAULT_DATABASE_URL = "postgresql://app:app_password@localhost:5432/ai_knowledge_atlas"


TABLE_COLUMNS: dict[str, list[str]] = {
    "learning_tracks": [
        "id",
        "slug",
        "title",
        "subtitle",
        "description",
        "difficulty",
        "estimated_hours",
        "prerequisites",
        "outcome_skills",
        "outcome_project",
        "icon",
        "sort_order",
        "status",
        "created_at",
        "updated_at",
    ],
    "modules": [
        "id",
        "track_id",
        "title",
        "description",
        "stage",
        "sort_order",
        "estimated_hours",
        "difficulty",
        "status",
        "created_at",
        "updated_at",
    ],
    "design_patterns": [
        "id",
        "name",
        "title",
        "category",
        "description",
        "motivation",
        "structure_diagram",
        "implementation_guide",
        "code_example_langchain",
        "code_example_anthropic",
        "tradeoffs",
        "when_to_use",
        "when_not_to_use",
        "related_pattern_ids",
        "related_graph_nodes",
        "enterprise_scenario",
        "interview_questions",
        "created_at",
        "updated_at",
    ],
    "lessons": [
        "id",
        "module_id",
        "title",
        "slug",
        "content_path",
        "sort_order",
        "difficulty",
        "estimated_minutes",
        "analogy",
        "one_liner",
        "experiment_config",
        "design_pattern_id",
        "graph_node_ids",
        "tags",
        "status",
        "created_at",
        "updated_at",
    ],
    "user_progress": [
        "id",
        "user_id",
        "lesson_id",
        "status",
        "experiment_status",
        "experiment_code",
        "notes",
        "started_at",
        "completed_at",
        "time_spent_seconds",
    ],
}


def read_rows(sqlite_conn: sqlite3.Connection, table: str, columns: list[str]) -> list[dict[str, Any]]:
    sqlite_conn.row_factory = sqlite3.Row
    column_sql = ", ".join(columns)
    return [dict(row) for row in sqlite_conn.execute(f"select {column_sql} from {table}")]


def upsert_rows(pg_conn: psycopg.Connection, table: str, columns: list[str], rows: Iterable[dict[str, Any]]) -> int:
    row_list = list(rows)
    if not row_list:
        return 0

    placeholders = ", ".join(["%s"] * len(columns))
    column_sql = ", ".join(columns)
    updates = ", ".join([f"{column} = excluded.{column}" for column in columns if column != "id"])
    sql = f"""
        insert into {table} ({column_sql})
        values ({placeholders})
        on conflict (id) do update set {updates}
    """
    values = [tuple(row[column] for column in columns) for row in row_list]
    with pg_conn.cursor() as cur:
        cur.executemany(sql, values)
    return len(row_list)


def main() -> None:
    sqlite_path = Path(os.environ.get("SQLITE_LEARNING_DB", DEFAULT_SQLITE_PATH))
    database_url = os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)

    if not sqlite_path.exists():
        raise SystemExit(f"SQLite database not found: {sqlite_path}")

    with sqlite3.connect(sqlite_path) as sqlite_conn:
        with psycopg.connect(database_url, row_factory=dict_row) as pg_conn:
            migrated: dict[str, int] = {}
            for table, columns in TABLE_COLUMNS.items():
                rows = read_rows(sqlite_conn, table, columns)
                migrated[table] = upsert_rows(pg_conn, table, columns, rows)
            pg_conn.commit()

    for table, count in migrated.items():
        print(f"{table}: {count}")


if __name__ == "__main__":
    main()
