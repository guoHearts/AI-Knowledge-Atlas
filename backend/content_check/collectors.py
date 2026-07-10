"""Collectors that normalize each content surface into ContentItem lists."""

from pathlib import Path
from typing import Any

import yaml

from content_check.models import ContentItem, parse_content_date

# backend/content_check/collectors.py -> repo root is two parents up from backend/.
REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_LABS_DIR = REPO_ROOT / "labs"
DEFAULT_COMPARE_DIR = REPO_ROOT / "docs" / "tech-comparisons"


def _has_official_source(sources: list[dict[str, Any]]) -> bool:
    """Treat any source type starting with 'official' as an official source.

    Radar/Labs use type 'official'; Compare frontmatter uses 'official-doc' and
    'official-github'.
    """
    return any(
        str(source.get("type", "")).lower().startswith("official")
        for source in sources
        if isinstance(source, dict)
    )


def collect_radar_items() -> list[ContentItem]:
    """Collect Radar items from the radar repository seed."""
    from modules.radar.repository import RADAR_ITEMS

    items: list[ContentItem] = []
    for raw in RADAR_ITEMS:
        sources = raw.get("sources", []) or []
        items.append(
            ContentItem(
                id=raw["id"],
                kind="radar",
                status=raw.get("status", ""),
                last_verified=parse_content_date(raw.get("last_verified_at")),
                has_official_source=_has_official_source(sources),
                source_count=len(sources),
                origin=f"radar:{raw['id']}",
                ci_status=None,
                path_exists=None,
            )
        )
    return items


def collect_lab_items(
    labs_dir: Path = DEFAULT_LABS_DIR,
    repo_root: Path = REPO_ROOT,
) -> list[ContentItem]:
    """Collect Lab items from every labs/*/metadata.yaml."""
    labs_dir = Path(labs_dir)
    items: list[ContentItem] = []
    for meta_path in sorted(labs_dir.glob("*/metadata.yaml")):
        data = yaml.safe_load(meta_path.read_text(encoding="utf-8")) or {}
        sources = data.get("sources", []) or []
        rel_path = data.get("path")
        if rel_path:
            path_exists = (Path(repo_root) / rel_path).is_dir()
        else:
            # Fall back to the metadata's own directory when path is omitted.
            path_exists = meta_path.parent.is_dir()
        items.append(
            ContentItem(
                id=data.get("id", meta_path.parent.name),
                kind="lab",
                status=_normalize_status(data.get("status", "")),
                last_verified=parse_content_date(data.get("lastVerifiedAt")),
                has_official_source=_has_official_source(sources),
                source_count=len(sources),
                origin=str(meta_path.relative_to(repo_root))
                if _is_relative_to(meta_path, repo_root)
                else str(meta_path),
                ci_status=data.get("ciStatus"),
                path_exists=path_exists,
            )
        )
    return items


def collect_compare_items(
    compare_dir: Path = DEFAULT_COMPARE_DIR,
    repo_root: Path = REPO_ROOT,
) -> list[ContentItem]:
    """Collect Compare items from tech-comparison Markdown frontmatter.

    Files without a leading frontmatter block are skipped. The section index
    (README.md) is not an article, so it is excluded from article-level checks —
    mirroring how the labs collector reads each lab's metadata rather than the
    directory listing.
    """
    compare_dir = Path(compare_dir)
    items: list[ContentItem] = []
    for md_path in sorted(compare_dir.glob("*.md")):
        if md_path.name.lower() == "readme.md":
            continue
        frontmatter = _read_frontmatter(md_path)
        if not frontmatter:
            continue
        sources = frontmatter.get("sources", []) or []
        items.append(
            ContentItem(
                id=md_path.stem,
                kind="compare",
                status=_normalize_status(frontmatter.get("status", "")),
                last_verified=parse_content_date(frontmatter.get("lastVerifiedAt")),
                has_official_source=_has_official_source(sources),
                source_count=len(sources),
                origin=str(md_path.relative_to(repo_root))
                if _is_relative_to(md_path, repo_root)
                else str(md_path),
                ci_status=None,
                path_exists=None,
            )
        )
    return items


def _read_frontmatter(md_path: Path) -> dict[str, Any]:
    """Extract and parse the leading YAML frontmatter block, or {} if absent."""
    text = md_path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    parsed = yaml.safe_load(parts[1])
    return parsed if isinstance(parsed, dict) else {}


def _normalize_status(status: str) -> str:
    """Map lowercase source status (e.g. 'verified') to the canonical form.

    Source files use lowercase; the canonical set is title-case (Verified, Stale,
    Draft, Deprecated). Unknown values pass through unchanged so the checker can
    flag them.
    """
    mapping = {
        "verified": "Verified",
        "stale": "Stale",
        "draft": "Draft",
        "deprecated": "Deprecated",
    }
    return mapping.get(str(status).lower(), str(status))


def _is_relative_to(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(Path(root).resolve())
        return True
    except ValueError:
        return False
