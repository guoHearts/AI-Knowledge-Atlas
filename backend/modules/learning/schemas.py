"""Learning API schemas."""

from typing import Any

from pydantic import BaseModel, Field


class ProgressUpsertRequest(BaseModel):
    lesson_id: str | None = None
    lessonId: str | None = None
    user_id: str | None = None
    userId: str | None = None
    status: str | None = None
    experiment_status: str | None = None
    experimentStatus: str | None = None
    experiment_code: str | None = None
    experimentCode: str | None = None
    notes: str | None = None

    def to_repository_payload(self) -> dict[str, Any]:
        lesson_id = self.lesson_id or self.lessonId
        if not lesson_id:
            raise ValueError("lessonId is required")

        return {
            "lesson_id": lesson_id,
            "user_id": self.user_id or self.userId or "default",
            "status": self.status,
            "experiment_status": self.experiment_status or self.experimentStatus,
            "experiment_code": self.experiment_code or self.experimentCode,
            "notes": self.notes,
        }


class ErrorData(BaseModel):
    detail: str = Field(default="")
