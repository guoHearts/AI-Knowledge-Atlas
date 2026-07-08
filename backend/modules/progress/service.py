"""Learning progress service stubs."""

from typing import Any

from modules.progress.schemas import ProgressUpdate


class ProgressService:
    def get_user_progress(self, user_id: str = "default") -> dict[str, Any]:
        return {
            "user_id": user_id,
            "message": "Progress data is managed by the Next.js frontend. Use /api/progress endpoint.",
            "progress": [],
        }

    def update_lesson_progress(
        self,
        user_id: str,
        lesson_id: str,
        update: ProgressUpdate,
    ) -> dict[str, Any]:
        return {
            "user_id": user_id,
            "lesson_id": lesson_id,
            "updated": update.model_dump(exclude_none=True),
        }

    def get_user_stats(self, user_id: str = "default") -> dict[str, Any]:
        return {
            "user_id": user_id,
            "total_lessons": 25,
            "completed_lessons": 0,
            "completion_rate": 0.0,
            "total_time_spent_seconds": 0,
        }

