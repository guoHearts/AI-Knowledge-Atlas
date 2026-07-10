import pytest

from common.errors import AppError
from modules.compare.repository import CompareRepository
from modules.compare.schemas import CompareArticle
from modules.compare.service import CompareService


class FakeCompareRepository:
    """Repository double whose single article is missing an official source."""

    def __init__(self, article: CompareArticle):
        self._article = article

    def list_articles(self, locale="zh-CN"):
        return [self._article]

    def get_article(self, article_id, locale="zh-CN"):
        return self._article if self._article.id == article_id else None

    def list_categories(self, locale="zh-CN"):
        return []


def _valid_article(**overrides) -> CompareArticle:
    data = {
        "id": "sample",
        "title": "Sample",
        "category": "mcp",
        "status": "Verified",
        "summary": "one-liner",
        "contenders": [
            {"name": "A", "vendor": "V", "latest_version": "1.0", "one_liner": "x"}
        ],
        "dimensions": [{"name": "Latency", "values": {"A": "low"}}],
        "use_when": [{"contender": "A", "scenario": "when x"}],
        "avoid_when": [{"contender": "A", "scenario": "when y"}],
        "decision_tree": [{"condition": "need x", "recommendation": "A"}],
        "cost_notes": ["cheap"],
        "sources": [
            {"type": "official", "title": "Doc", "url": "https://example.com"}
        ],
        "related_lab_ids": ["secure-mcp-server"],
        "related_radar_item_ids": [],
        "related_node_ids": [],
        "related_learning_paths": [],
        "published_at": "2026-07-09T09:00:00Z",
        "created_at": "2026-07-09T09:00:00Z",
        "updated_at": "2026-07-09T09:00:00Z",
        "last_verified_at": "2026-07-09T09:00:00Z",
    }
    data.update(overrides)
    return CompareArticle(**data)


def test_list_articles_returns_seed_sorted_newest_first():
    service = CompareService()

    articles = service.list_articles()

    assert len(articles) >= 1
    published = [a.published_at for a in articles]
    assert published == sorted(published, reverse=True)
    assert any(a.id == "mcp-vs-function-calling-vs-rest" for a in articles)


def test_list_articles_filters_by_category():
    service = CompareService()

    articles = service.list_articles(category="mcp")

    assert articles
    assert all(a.category == "mcp" for a in articles)


def test_mcp_article_has_trust_metadata_and_downstream_paths():
    service = CompareService()

    article = service.get_article("mcp-vs-function-calling-vs-rest")

    assert article.status == "Verified"
    assert article.last_verified_at
    assert any(source.type == "official" for source in article.sources)
    assert article.related_lab_ids == ["secure-mcp-server"]
    assert "mcp-security-boundary-2026-07" in article.related_radar_item_ids
    assert "MCP" in article.related_node_ids
    assert len(article.contenders) >= 3
    assert article.dimensions
    assert article.decision_tree


def test_mcp_article_switches_language_by_locale():
    service = CompareService()

    zh_article = service.get_article("mcp-vs-function-calling-vs-rest", locale="zh-CN")
    en_article = service.get_article("mcp-vs-function-calling-vs-rest", locale="en-US")

    assert zh_article.title != en_article.title
    assert zh_article.id == en_article.id
    # contender names are locale-neutral proper nouns and must stay identical
    assert [c.name for c in zh_article.contenders] == [c.name for c in en_article.contenders]
    # nested dimension cell text is localized
    assert zh_article.dimensions[0].values != en_article.dimensions[0].values


def test_get_article_raises_for_missing():
    service = CompareService()

    with pytest.raises(AppError) as exc_info:
        service.get_article("does-not-exist")

    assert exc_info.value.code == "COMPARE_ARTICLE_NOT_FOUND"
    assert exc_info.value.status_code == 404


def test_verified_article_missing_official_source_is_rejected():
    bad = _valid_article(
        sources=[{"type": "community", "title": "Blog", "url": "https://example.com"}]
    )
    service = CompareService(FakeCompareRepository(bad))

    with pytest.raises(AppError) as exc_info:
        service.list_articles()

    assert exc_info.value.code == "COMPARE_ARTICLE_INVALID"


def test_repository_exposes_categories():
    categories = CompareRepository().list_categories()

    assert any(category.id == "mcp" for category in categories)
