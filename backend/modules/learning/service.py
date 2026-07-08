"""Learning service layer."""

from typing import Any, Protocol

from common.errors import AppError
from modules.learning import catalog


class LearningRepositoryProtocol(Protocol):
    def list_tracks(self) -> list[dict[str, Any]]: ...
    def get_track(self, slug: str) -> dict[str, Any] | None: ...
    def get_module(self, module_id: str) -> dict[str, Any] | None: ...
    def get_lesson(self, lesson_id: str) -> dict[str, Any] | None: ...
    def list_design_patterns(self) -> list[dict[str, Any]]: ...
    def get_design_pattern(self, pattern_id: str) -> dict[str, Any] | None: ...
    def list_progress(self, user_id: str) -> list[dict[str, Any]]: ...
    def upsert_progress(self, payload: dict[str, Any]) -> dict[str, Any]: ...
    def get_home_stats(self, user_id: str) -> dict[str, Any]: ...
    def get_cms_dashboard(self) -> dict[str, Any]: ...


class LearningService:
    def __init__(self, repository: LearningRepositoryProtocol):
        self.repository = repository

    def list_tracks(self) -> list[dict[str, Any]]:
        return self.repository.list_tracks()

    def get_track(self, slug: str) -> dict[str, Any]:
        return self._required(self.repository.get_track(slug), "track", slug)

    def get_module(self, module_id: str) -> dict[str, Any]:
        return self._required(self.repository.get_module(module_id), "module", module_id)

    def get_lesson(self, lesson_id: str) -> dict[str, Any]:
        return self._required(self.repository.get_lesson(lesson_id), "lesson", lesson_id)

    def list_design_patterns(self) -> list[dict[str, Any]]:
        return self.repository.list_design_patterns()

    def get_design_pattern(self, pattern_id: str) -> dict[str, Any]:
        return self._required(self.repository.get_design_pattern(pattern_id), "design_pattern", pattern_id)

    def list_progress(self, user_id: str) -> list[dict[str, Any]]:
        return self.repository.list_progress(user_id)

    def upsert_progress(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.upsert_progress(payload)

    def get_home_stats(self, user_id: str = "default") -> dict[str, Any]:
        return self.repository.get_home_stats(user_id)

    def get_cms_dashboard(self) -> dict[str, Any]:
        return self.repository.get_cms_dashboard()

    def get_home_content(self) -> dict[str, Any]:
        return {
            "roadmap": catalog.ROADMAP,
            "nextSteps": catalog.NEXT_STEPS,
        }

    def get_metadata(self) -> dict[str, Any]:
        return {
            "stageLabels": catalog.STAGE_LABELS,
            "analogies": catalog.ANALOGIES,
            "difficultyLabels": catalog.DIFFICULTY_LABELS,
            "categoryLabels": catalog.CATEGORY_LABELS,
        }

    def list_labs(self) -> list[dict[str, Any]]:
        return catalog.LABS

    def get_lab(self, lab_id: str) -> dict[str, Any]:
        lab = next((item for item in catalog.LABS if item["id"] == lab_id), None)
        return self._required(lab, "lab", lab_id)

    def _required(self, value: dict[str, Any] | None, resource: str, identifier: str) -> dict[str, Any]:
        if value is None:
            raise AppError(
                code="LEARNING_NOT_FOUND",
                message=f"{resource} not found",
                status_code=404,
                details={"resource": resource, "id": identifier},
            )
        return value
