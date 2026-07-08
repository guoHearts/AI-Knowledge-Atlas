import pytest

from common.errors import AppError
from modules.content.service import ContentService
from modules.progress.schemas import ProgressUpdate
from modules.progress.service import ProgressService
from modules.share.schemas import ShareRequest
from modules.share.service import ShareService


def test_content_service_lists_design_patterns():
    service = ContentService()

    patterns = service.list_design_patterns()

    assert patterns[0]["id"] == "pipeline"
    assert {pattern["id"] for pattern in patterns} >= {"router", "self-healing"}


def test_content_service_returns_empty_graph_node_lessons_stub():
    service = ContentService()

    result = service.get_lessons_for_graph_node("mcp-protocol")

    assert result == {"node_id": "mcp-protocol", "lessons": []}


def test_progress_service_returns_legacy_stub_responses():
    service = ProgressService()

    progress = service.get_user_progress("default")
    update = service.update_lesson_progress(
        "default",
        "lesson-1",
        ProgressUpdate(status="completed", lesson_id="lesson-1"),
    )
    stats = service.get_user_stats("default")

    assert progress["progress"] == []
    assert update["updated"]["status"] == "completed"
    assert stats["total_lessons"] == 25


def test_share_service_creates_deterministic_share_link_and_retrieves_payload():
    service = ShareService()

    response = service.create_share(
        ShareRequest(node_ids=["rag"], node_types=["Technology"], view_center="rag", zoom=1.2),
        base_url="http://localhost:8000",
    )

    assert response.share_id == "3dc1b3e3"
    assert response.url == "http://localhost:8000/s/3dc1b3e3"
    assert service.get_share(response.share_id) == {
        "node_ids": ["rag"],
        "node_types": ["Technology"],
        "view_center": "rag",
        "zoom": 1.2,
    }


def test_share_service_raises_app_error_for_missing_share():
    service = ShareService()

    with pytest.raises(AppError) as exc_info:
        service.get_share("missing")

    assert exc_info.value.code == "SHARE_NOT_FOUND"
    assert exc_info.value.status_code == 404
