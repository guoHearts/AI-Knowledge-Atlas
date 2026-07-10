"""Business rules for AI Engineering Radar."""

import re

from common.errors import AppError
from common.i18n import DEFAULT_LOCALE, resolve_locale
from modules.radar.repository import RadarRepository
from modules.radar.schemas import RadarCategory, RadarItem, WeeklyRadar, WeeklyRadarPeriod

WEEK_PATTERN = re.compile(r"^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$")

_WEEKLY_SUMMARY = {
    "zh": "本期聚焦生产级 Agent 模式、MCP 安全边界、混合 RAG 基线与评估门禁。",
    "en": "This issue focuses on production agent patterns, MCP security boundaries, hybrid RAG baselines, and evaluation gates.",
}


class RadarService:
    def __init__(self, repository: RadarRepository | None = None):
        self.repository = repository or RadarRepository()

    def list_items(self, category: str | None = None, locale: str = DEFAULT_LOCALE) -> list[RadarItem]:
        items = self.repository.list_items(locale=locale)
        for item in items:
            self._validate_item(item)
        if category:
            items = [item for item in items if item.category == category]
        return sorted(items, key=lambda item: item.published_at, reverse=True)

    def get_item(self, item_id: str, locale: str = DEFAULT_LOCALE) -> RadarItem:
        item = self.repository.get_item(item_id, locale=locale)
        if item is None:
            raise AppError(
                code="RADAR_ITEM_NOT_FOUND",
                message="Radar item not found",
                status_code=404,
                details={"itemId": item_id},
            )
        return item

    def list_categories(self, locale: str = DEFAULT_LOCALE) -> list[RadarCategory]:
        return self.repository.list_categories(locale=locale)

    def get_weekly_radar(self, week_number: str, locale: str = DEFAULT_LOCALE) -> WeeklyRadar:
        if not WEEK_PATTERN.match(week_number):
            raise AppError(
                code="RADAR_WEEK_INVALID",
                message="Invalid week format. Use YYYY-W## (e.g., 2026-W27)",
                status_code=400,
                details={"week": week_number},
            )

        items = self.list_items(locale=locale)
        return WeeklyRadar(
            week=week_number,
            period=WeeklyRadarPeriod(start="2026-07-08", end="2026-07-14"),
            items=items,
            summary=resolve_locale(_WEEKLY_SUMMARY, locale),
        )

    def _validate_item(self, item: RadarItem) -> None:
        missing: list[str] = []
        if item.status not in {"Verified", "Draft", "Stale", "Deprecated"}:
            missing.append("valid status")
        if not item.last_verified_at:
            missing.append("last_verified_at")
        if not item.published_at:
            missing.append("published_at")
        if not item.sources:
            missing.append("sources")
        if not any(source.type == "official" for source in item.sources):
            missing.append("official source")
        if not (item.related_lab_ids or item.related_node_ids or item.related_learning_paths):
            missing.append("related path")

        if missing:
            raise AppError(
                code="RADAR_ITEM_INVALID",
                message="Radar item is missing required trust metadata",
                status_code=500,
                details={"itemId": item.id, "missing": missing},
            )
