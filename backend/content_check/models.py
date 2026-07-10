"""Shared data model and helpers for content freshness detection."""

from dataclasses import dataclass
from datetime import date

# Severity levels for a finding.
SEVERITY_ERROR = "error"
SEVERITY_NEEDS_REVIEW = "needs-review"
SEVERITY_OK = "ok"

# Valid content statuses per docs/content-standards.md.
VALID_STATUSES = {"Verified", "Stale", "Draft", "Deprecated"}


def parse_content_date(raw: str | None) -> date | None:
    """Parse a content date.

    Accepts a plain ISO date ("2026-07-09") or an ISO datetime
    ("2026-07-08T09:00:00Z"). Returns None for empty or unparseable input.
    """
    if not raw:
        return None
    try:
        return date.fromisoformat(str(raw)[:10])
    except ValueError:
        return None


@dataclass
class ContentItem:
    """A trust-bearing content item normalized across sources."""

    id: str
    kind: str  # "radar" | "lab" | "compare"
    status: str
    last_verified: date | None
    has_official_source: bool
    source_count: int
    origin: str  # file path or repository id, for reporting
    ci_status: str | None = None
    path_exists: bool | None = None


@dataclass
class Finding:
    """A single rule violation for a content item."""

    item_id: str
    kind: str
    severity: str
    rule: str
    message: str
    origin: str
