"""Business rules for AI Engineering Radar."""

import re

from common.errors import AppError
from modules.radar.repository import RadarRepository
from modules.radar.schemas import RadarCategory, RadarItem, WeeklyRadar, WeeklyRadarPeriod

WEEK_PATTERN = re.compile(r"^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$")


class RadarService:
    def __init__(self, repository: RadarRepository | None = None):
        self.repository = repository or RadarRepository()

    def list_items(self, category: str | None = None) -> list[RadarItem]:
        items = self.repository.list_items()
        if category:
            items = [item for item in items if item.category == category]
        return sorted(items, key=lambda item: item.created_at, reverse=True)

    def get_item(self, item_id: str) -> RadarItem:
        item = self.repository.get_item(item_id)
        if item is None:
            raise AppError(
                code="RADAR_ITEM_NOT_FOUND",
                message="Radar item not found",
                status_code=404,
                details={"itemId": item_id},
            )
        return item

    def list_categories(self) -> list[RadarCategory]:
        return self.repository.list_categories()

    def get_weekly_radar(self, week_number: str) -> WeeklyRadar:
        if not WEEK_PATTERN.match(week_number):
            raise AppError(
                code="RADAR_WEEK_INVALID",
                message="Invalid week format. Use YYYY-W## (e.g., 2026-W27)",
                status_code=400,
                details={"week": week_number},
            )

        items = self.list_items()
        return WeeklyRadar(
            week=week_number,
            period=WeeklyRadarPeriod(start="2026-07-01", end="2026-07-07"),
            items=items,
            summary="This week focuses on Agent frameworks and MCP security patterns, representing key trends in production AI engineering.",
        )
