import pytest

from common.errors import AppError
from modules.learning.service import LearningService


class FakeLearningRepository:
    def list_tracks(self):
        return [{"id": "track-1", "slug": "agent-engineer"}]

    def get_track(self, slug: str):
        if slug == "missing":
            return None
        return {"id": "track-1", "slug": slug, "modules": [{"id": "module-1"}]}

    def get_module(self, module_id: str):
        if module_id == "missing":
            return None
        return {"id": module_id, "lessons": [{"id": "lesson-1"}]}

    def get_lesson(self, lesson_id: str):
        if lesson_id == "missing":
            return None
        return {"id": lesson_id, "slug": "protocol"}

    def list_design_patterns(self):
        return [{"id": "router", "name": "router"}]

    def get_design_pattern(self, pattern_id: str):
        if pattern_id == "missing":
            return None
        return {"id": pattern_id, "name": "router"}

    def list_progress(self, user_id: str):
        return [{"id": "progress-1", "user_id": user_id}]

    def upsert_progress(self, payload: dict):
        return {"id": "progress-1", **payload}

    def get_home_stats(self, user_id: str):
        return {
            "totalModules": 1,
            "totalLessons": 1,
            "completedLessons": 1,
            "totalPatterns": 1,
            "completionRate": 100,
        }

    def get_cms_dashboard(self):
        return {
            "stats": {
                "trackCount": 1,
                "publishedLessonCount": 1,
                "draftLessonCount": 0,
                "designPatternCount": 1,
            },
            "tracks": [{"id": "track-1", "moduleCount": 1, "lessonCount": 1}],
        }


def test_learning_service_delegates_read_models():
    service = LearningService(FakeLearningRepository())

    assert service.list_tracks()[0]["slug"] == "agent-engineer"
    assert service.get_track("agent-engineer")["modules"][0]["id"] == "module-1"
    assert service.get_module("module-1")["lessons"][0]["id"] == "lesson-1"
    assert service.get_lesson("lesson-1")["slug"] == "protocol"
    assert service.list_design_patterns()[0]["name"] == "router"
    assert service.get_home_stats("default")["completionRate"] == 100
    assert service.get_home_content()["roadmap"][0]["layer"] == "01"
    assert service.get_metadata()["difficultyLabels"]["beginner"] == "入门"
    assert service.list_labs()[0]["id"] == "secure-mcp-server"
    assert service.get_lab("secure-mcp-server")["estimatedSetupTime"] == "15min"
    assert service.get_cms_dashboard()["stats"]["trackCount"] == 1


def test_learning_service_raises_app_error_for_missing_records():
    service = LearningService(FakeLearningRepository())

    with pytest.raises(AppError) as exc_info:
        service.get_lesson("missing")

    assert exc_info.value.code == "LEARNING_NOT_FOUND"
    assert exc_info.value.status_code == 404


def test_learning_service_updates_progress():
    service = LearningService(FakeLearningRepository())

    result = service.upsert_progress({
        "lessonId": "lesson-1",
        "status": "completed",
        "userId": "default",
    })

    assert result["lessonId"] == "lesson-1"
    assert result["status"] == "completed"
