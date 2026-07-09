"""Schemas for the Compare (技术选型) API.

A Compare article answers a real technology-selection question. The structure
follows strategy doc §6.2: contenders, a capability matrix, use/avoid scenarios,
cost notes, a decision tree, official sources, and links to a runnable lab.
"""

from pydantic import BaseModel, Field


class CompareSource(BaseModel):
    type: str
    title: str
    url: str


class CompareContender(BaseModel):
    name: str
    vendor: str = ""
    latest_version: str = ""
    one_liner: str = ""


class CompareDimension(BaseModel):
    """One row of the capability matrix: a dimension mapped to per-contender cells."""

    name: str
    values: dict[str, str] = Field(default_factory=dict)


class CompareScenario(BaseModel):
    contender: str
    scenario: str


class CompareDecision(BaseModel):
    condition: str
    recommendation: str


class CompareArticle(BaseModel):
    id: str
    title: str
    category: str
    status: str
    summary: str
    contenders: list[CompareContender] = Field(default_factory=list)
    dimensions: list[CompareDimension] = Field(default_factory=list)
    use_when: list[CompareScenario] = Field(default_factory=list)
    avoid_when: list[CompareScenario] = Field(default_factory=list)
    decision_tree: list[CompareDecision] = Field(default_factory=list)
    cost_notes: list[str] = Field(default_factory=list)
    sources: list[CompareSource] = Field(default_factory=list)
    related_lab_ids: list[str] = Field(default_factory=list)
    related_radar_item_ids: list[str] = Field(default_factory=list)
    related_node_ids: list[str] = Field(default_factory=list)
    related_learning_paths: list[str] = Field(default_factory=list)
    published_at: str
    created_at: str
    updated_at: str
    last_verified_at: str


class CompareCategory(BaseModel):
    id: str
    name: str
    description: str = ""
