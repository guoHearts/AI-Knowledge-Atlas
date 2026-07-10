"""Business rules for the Compare (技术选型) section."""

from common.errors import AppError
from common.i18n import DEFAULT_LOCALE
from modules.compare.repository import CompareRepository
from modules.compare.schemas import CompareArticle, CompareCategory

VALID_STATUSES = {"Verified", "Draft", "Stale", "Deprecated"}


class CompareService:
    def __init__(self, repository: CompareRepository | None = None):
        self.repository = repository or CompareRepository()

    def list_articles(self, category: str | None = None, locale: str = DEFAULT_LOCALE) -> list[CompareArticle]:
        articles = self.repository.list_articles(locale=locale)
        for article in articles:
            self._validate_article(article)
        if category:
            articles = [a for a in articles if a.category == category]
        return sorted(articles, key=lambda a: a.published_at, reverse=True)

    def get_article(self, article_id: str, locale: str = DEFAULT_LOCALE) -> CompareArticle:
        article = self.repository.get_article(article_id, locale=locale)
        if article is None:
            raise AppError(
                code="COMPARE_ARTICLE_NOT_FOUND",
                message="Compare article not found",
                status_code=404,
                details={"articleId": article_id},
            )
        self._validate_article(article)
        return article

    def list_categories(self, locale: str = DEFAULT_LOCALE) -> list[CompareCategory]:
        return self.repository.list_categories(locale=locale)

    def _validate_article(self, article: CompareArticle) -> None:
        missing: list[str] = []
        if article.status not in VALID_STATUSES:
            missing.append("valid status")
        if not article.last_verified_at:
            missing.append("last_verified_at")
        if not article.published_at:
            missing.append("published_at")
        if not article.sources:
            missing.append("sources")
        if not any(source.type == "official" for source in article.sources):
            missing.append("official source")
        if not (
            article.related_lab_ids
            or article.related_radar_item_ids
            or article.related_node_ids
            or article.related_learning_paths
        ):
            missing.append("related path")

        if missing:
            raise AppError(
                code="COMPARE_ARTICLE_INVALID",
                message="Compare article is missing required trust metadata",
                status_code=500,
                details={"articleId": article.id, "missing": missing},
            )
