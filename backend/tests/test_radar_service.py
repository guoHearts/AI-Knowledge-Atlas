import pytest

from common.errors import AppError
from modules.radar.service import RadarService


def test_list_items_returns_newest_first():
    service = RadarService()

    items = service.list_items()

    assert [item.id for item in items] == [
        "openai-agents-sdk-2026-07",
        "mcp-security-best-practices-2026-07",
        "vector-databases-hybrid-search-2026-07",
    ]


def test_list_items_filters_by_category():
    service = RadarService()

    items = service.list_items(category="mcp")

    assert len(items) == 1
    assert items[0].id == "mcp-security-best-practices-2026-07"
    assert items[0].category == "mcp"


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
