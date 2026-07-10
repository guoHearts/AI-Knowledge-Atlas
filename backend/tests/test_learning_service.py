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
    assert service.get_home_content("zh-CN")["roadmap"][0]["title"] == "Agent 基础"
    assert service.get_home_content("en-US")["roadmap"][0]["title"] == "Agent foundations"
    assert isinstance(service.get_home_content("en-US")["nextSteps"][0], str)
    assert service.get_metadata()["difficultyLabels"]["beginner"] == "入门"
    assert service.list_labs()[0]["id"] == "secure-mcp-server"
    assert service.get_lab("secure-mcp-server")["estimatedSetupTime"] == "15min"
    assert service.get_cms_dashboard()["stats"]["trackCount"] == 1


def test_verified_secure_mcp_lab_exposes_trust_evidence():
    service = LearningService(FakeLearningRepository())

    lab = service.get_lab("secure-mcp-server", locale="en-US")

    assert lab["status"] == "Verified"
    assert lab["lastVerifiedAt"] == "2026-07-09"
    assert lab["packages"] == [
        {"name": "fastapi", "version": "0.115.0"},
        {"name": "uvicorn", "version": "0.30.0"},
        {"name": "pydantic", "version": "2.9.0"},
        {"name": "pydantic-settings", "version": "2.5.0"},
        {"name": "python-dotenv", "version": "1.2.2"},
        {"name": "structlog", "version": "24.1.0"},
        {"name": "slowapi", "version": "0.1.9"},
        {"name": "pyyaml", "version": "6.0.1"},
        {"name": "requests", "version": "2.31.0"},
    ]
    assert any(source["type"] == "official" for source in lab["sources"])
    assert any("pytest" in output for output in lab["expectedOutputs"])
    assert any(mode["title"] == "Missing API key" for mode in lab["failureModes"])
    assert any("allowlist" in note.lower() for note in lab["securityNotes"])
    assert any("rate limiting" in limitation.lower() for limitation in lab["knownLimitations"])
    assert lab["relatedRadarItemIds"] == ["mcp-security-boundary-2026-07"]
    assert "MCP" in lab["relatedNodeIds"]
    assert lab["relatedLearningPaths"][0]["href"].startswith("/learn/")
    assert lab["relatedCompareIds"] == ["mcp-vs-function-calling-vs-rest"]


def test_labs_switch_language_by_locale():
    service = LearningService(FakeLearningRepository())

    zh_lab = service.get_lab("secure-mcp-server", locale="zh-CN")
    en_lab = service.get_lab("secure-mcp-server", locale="en-US")

    assert zh_lab["title"] != en_lab["title"]
    assert zh_lab["id"] == en_lab["id"]
    assert zh_lab["status"] == en_lab["status"]  # enum tokens stay locale-neutral
    assert zh_lab["failureModes"][0]["title"] != en_lab["failureModes"][0]["title"]


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
