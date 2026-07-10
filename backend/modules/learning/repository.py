"""PostgreSQL repository for learning content and progress."""

from typing import Any
from uuid import uuid4


class LearningRepository:
    def __init__(self, conn: Any):
        self.conn = conn

    def list_tracks(self) -> list[dict[str, Any]]:
        return self._fetch_all(
            "select * from learning_tracks where status = 'published' order by sort_order"
        )

    def get_track(self, slug: str) -> dict[str, Any] | None:
        track = self._fetch_one("select * from learning_tracks where slug = %s", (slug,))
        if not track:
            return None
        track["modules"] = self._fetch_all(
            "select * from modules where track_id = %s order by sort_order",
            (track["id"],),
        )
        return track

    def get_module(self, module_id: str) -> dict[str, Any] | None:
        module = self._fetch_one("select * from modules where id = %s", (module_id,))
        if not module:
            return None
        module["lessons"] = self._fetch_all(
            "select * from lessons where module_id = %s and status = 'published' order by sort_order",
            (module_id,),
        )
        return module

    def get_lesson(self, lesson_id: str) -> dict[str, Any] | None:
        return self._fetch_one("select * from lessons where id = %s", (lesson_id,))

    def list_design_patterns(self) -> list[dict[str, Any]]:
        return self._fetch_all("select * from design_patterns order by category")

    def get_design_pattern(self, pattern_id: str) -> dict[str, Any] | None:
        return self._fetch_one(
            "select * from design_patterns where id = %s or name = %s",
            (pattern_id, pattern_id),
        )

    def list_progress(self, user_id: str) -> list[dict[str, Any]]:
        return self._fetch_all(
            "select * from user_progress where user_id = %s",
            (user_id,),
        )

    def upsert_progress(self, payload: dict[str, Any]) -> dict[str, Any]:
        lesson_id = payload["lesson_id"]
        user_id = payload.get("user_id") or "default"
        existing = self._fetch_one(
            "select * from user_progress where user_id = %s and lesson_id = %s",
            (user_id, lesson_id),
        )

        if existing:
            fields: list[str] = []
            values: list[Any] = []
            for key in ("status", "experiment_status", "experiment_code", "notes"):
                if payload.get(key) is not None:
                    fields.append(f"{key} = %s")
                    values.append(payload[key])
            if payload.get("status") == "completed":
                fields.append("completed_at = now()")
            if payload.get("status") == "in_progress" and not existing.get("started_at"):
                fields.append("started_at = now()")
            if fields:
                self._execute(
                    f"update user_progress set {', '.join(fields)} where user_id = %s and lesson_id = %s",
                    (*values, user_id, lesson_id),
                )
        else:
            self._execute(
                """
                insert into user_progress (
                  id, user_id, lesson_id, status, experiment_status, experiment_code, notes, started_at, completed_at
                )
                values (%s, %s, %s, %s, %s, %s, %s,
                  case when %s = 'in_progress' then now() else null end,
                  case when %s = 'completed' then now() else null end
                )
                """,
                (
                    str(uuid4()),
                    user_id,
                    lesson_id,
                    payload.get("status") or "in_progress",
                    payload.get("experiment_status"),
                    payload.get("experiment_code"),
                    payload.get("notes"),
                    payload.get("status") or "in_progress",
                    payload.get("status") or "in_progress",
                ),
            )
        self.conn.commit()
        return self._fetch_one(
            "select * from user_progress where user_id = %s and lesson_id = %s",
            (user_id, lesson_id),
        )

    def get_home_stats(self, user_id: str) -> dict[str, Any]:
        stats = self._fetch_one(
            """
            select
              count(distinct m.id) as "totalModules",
              count(distinct l.id) as "totalLessons",
              count(distinct case when up.status = 'completed' then l.id end) as "completedLessons"
            from modules m
            left join lessons l on l.module_id = m.id and l.status = 'published'
            left join user_progress up on up.lesson_id = l.id and up.user_id = %s
            where m.status = 'published'
            """,
            (user_id,),
        )
        pattern_stats = self._fetch_one('select count(*) as "totalPatterns" from design_patterns')
        total_lessons = stats["totalLessons"] or 0
        completed_lessons = stats["completedLessons"] or 0
        return {
            **stats,
            "totalPatterns": pattern_stats["totalPatterns"],
            "completionRate": round((completed_lessons / total_lessons) * 100) if total_lessons else 0,
        }

    def get_cms_dashboard(self) -> dict[str, Any]:
        tracks = self._fetch_all("select * from learning_tracks order by sort_order")
        published = self._fetch_one("select count(*) as cnt from lessons where status = 'published'")
        draft = self._fetch_one("select count(*) as cnt from lessons where status = 'draft'")
        design_patterns = self._fetch_one("select count(*) as cnt from design_patterns")
        return {
            "stats": {
                "trackCount": len(tracks),
                "publishedLessonCount": published["cnt"],
                "draftLessonCount": draft["cnt"],
                "designPatternCount": design_patterns["cnt"],
            },
            "tracks": [self._track_summary(track) for track in tracks],
        }

    def _track_summary(self, track: dict[str, Any]) -> dict[str, Any]:
        counts = self._fetch_one(
            """
            select
              count(distinct m.id) as "moduleCount",
              count(distinct l.id) as "lessonCount"
            from modules m
            left join lessons l on l.module_id = m.id
            where m.track_id = %s
            """,
            (track["id"],),
        )
        return {**track, **counts}

    def _fetch_all(self, sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
        with self.conn.cursor() as cur:
            cur.execute(sql, params)
            return list(cur.fetchall())

    def _fetch_one(self, sql: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
        with self.conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchone()

    def _execute(self, sql: str, params: tuple[Any, ...]) -> None:
        with self.conn.cursor() as cur:
            cur.execute(sql, params)
