"""Progress API schemas."""

from typing import Optional

from pydantic import BaseModel


class ProgressUpdate(BaseModel):
    user_id: str = "default"
    lesson_id: str
    status: Optional[str] = None
    experiment_status: Optional[str] = None
    experiment_code: Optional[str] = None
    notes: Optional[str] = None

