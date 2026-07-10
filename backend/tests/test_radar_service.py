import pytest

from common.errors import AppError
from modules.radar.service import RadarService


def test_list_items_returns_newest_first():
    service = RadarService()

    items = service.list_items()

    assert [item.id for item in items] == [
        "openai-agents-sdk-production-patterns-2026-07",
        "mcp-security-boundary-2026-07",
        "langgraph-stateful-agent-workflows-2026-07",
        "hybrid-rag-baseline-2026-07",
        "llm-evals-regression-gates-2026-07",
    ]


def test_list_items_filters_by_category():
    service = RadarService()

    items = service.list_items(category="mcp")

    assert len(items) == 1
    assert items[0].id == "mcp-security-boundary-2026-07"
    assert items[0].category == "mcp"


def test_radar_items_have_trust_metadata_and_downstream_paths():
    service = RadarService()

    items = service.list_items()

    assert len(items) >= 3
    for item in items:
        assert item.status in {"Verified", "Draft", "Stale", "Deprecated"}
        assert item.published_at
        assert item.last_verified_at
        assert item.sources
        assert any(source.type == "official" for source in item.sources)
        assert item.related_lab_ids or item.related_node_ids or item.related_learning_paths


def test_get_item_raises_business_error_for_missing_item():
    service = RadarService()

    with pytest.raises(AppError) as exc_info:
        service.get_item("missing-radar-item")

    assert exc_info.value.code == "RADAR_ITEM_NOT_FOUND"
    assert exc_info.value.status_code == 404


def test_get_weekly_radar_rejects_invalid_week():
    service = RadarService()

    with pytest.raises(AppError) as exc_info:
        service.get_weekly_radar("2026-99")

    assert exc_info.value.code == "RADAR_WEEK_INVALID"
    assert exc_info.value.status_code == 400


def test_list_items_switches_language_by_locale():
    service = RadarService()

    zh_item = service.get_item("mcp-security-boundary-2026-07", locale="zh-CN")
    en_item = service.get_item("mcp-security-boundary-2026-07", locale="en-US")

    assert zh_item.title != en_item.title
    assert "MCP" in zh_item.title
    assert "MCP" in en_item.title
    # id/status/sources stay identical across locales
    assert zh_item.id == en_item.id
    assert zh_item.status == en_item.status


def test_list_categories_switches_language_by_locale():
    service = RadarService()

    zh_categories = {c.id: c.name for c in service.list_categories(locale="zh-CN")}
    en_categories = {c.id: c.name for c in service.list_categories(locale="en-US")}

    assert zh_categories.keys() == en_categories.keys()
    assert zh_categories["evaluation"] != en_categories["evaluation"]
