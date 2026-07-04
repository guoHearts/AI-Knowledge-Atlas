"""Learning progress API endpoints.

These endpoints proxy to the SQLite database managed by the Next.js frontend.
In the current architecture, progress is primarily handled by Next.js Route Handlers.
This module provides a backend-side access point for future cross-service needs.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/progress", tags=["progress"])


class ProgressUpdate(BaseModel):
    user_id: str = "default"
    lesson_id: str
    status: Optional[str] = None          # not_started | in_progress | completed
    experiment_status: Optional[str] = None
    experiment_code: Optional[str] = None
    notes: Optional[str] = None


@router.get("/{user_id}")
async def get_user_progress(user_id: str = "default"):
    """Get all progress for a user."""
    # In production: query SQLite via shared volume or API call
    return {
        "user_id": user_id,
        "message": "Progress data is managed by the Next.js frontend. Use /api/progress endpoint.",
        "progress": [],
    }


@router.put("/{user_id}/lesson/{lesson_id}")
async def update_lesson_progress(user_id: str, lesson_id: str, update: ProgressUpdate):
    """Update progress for a specific lesson. Delegates to Next.js in production."""
    return {
        "user_id": user_id,
        "lesson_id": lesson_id,
        "updated": update.model_dump(exclude_none=True),
    }


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str = "default"):
    """Get learning statistics for a user."""
    return {
        "user_id": user_id,
        "total_lessons": 25,
        "completed_lessons": 0,
        "completion_rate": 0.0,
        "total_time_spent_seconds": 0,
    }
