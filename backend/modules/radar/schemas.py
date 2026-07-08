"""Schemas for AI Engineering Radar API."""

from pydantic import BaseModel, Field


class RadarSource(BaseModel):
    type: str
    url: str
    title: str


class RadarItem(BaseModel):
    id: str
    title: str
    category: str
    status: str
    maturity: str
    summary: str
    why_it_matters: str
    recommended_for: str
    not_recommended_for: str = ""
    has_lab: bool
    lab_id: str | None = None
    sources: list[RadarSource] = Field(default_factory=list)
    related_lab_ids: list[str] = Field(default_factory=list)
    related_node_ids: list[str] = Field(default_factory=list)
    related_learning_paths: list[str] = Field(default_factory=list)
    published_at: str
    created_at: str
    updated_at: str
    last_verified_at: str


class RadarCategory(BaseModel):
    id: str
    name: str
    description: str = ""


class WeeklyRadarPeriod(BaseModel):
    start: str
    end: str


class WeeklyRadar(BaseModel):
    week: str
    period: WeeklyRadarPeriod
    items: list[RadarItem]
    summary: str
