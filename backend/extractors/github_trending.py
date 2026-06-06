"""GitHub Trending API adapter — fetch trending AI/ML repos."""

import aiohttp
from datetime import datetime, timezone, timedelta
from typing import List
from extractors.base import BaseExtractor, RawDocument

GITHUB_TRENDING_URL = "https://api.github.com/search/repositories"


class GitHubTrendingExtractor(BaseExtractor):
    def name(self) -> str:
        return "github-trending"

    async def fetch(self, since: datetime | None = None) -> List[RawDocument]:
        if since is None:
            since = datetime.now(timezone.utc) - timedelta(days=7)

        # Search for AI/ML repos created or pushed recently
        date_str = since.strftime("%Y-%m-%d")
        query = f"topic:artificial-intelligence+OR+topic:llm+OR+topic:agent+pushed:>={date_str}"

        headers = {"Accept": "application/vnd.github.v3+json"}
        params = {"q": query, "sort": "stars", "order": "desc", "per_page": "20"}

        async with aiohttp.ClientSession() as session:
            async with session.get(GITHUB_TRENDING_URL, headers=headers, params=params) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()

        docs = []
        for repo in data.get("items", []):
            description = repo.get("description") or ""
            topics = ", ".join(repo.get("topics", []))
            docs.append(RawDocument(
                source="github-trending",
                source_id=str(repo["id"]),
                title=repo["full_name"],
                content=f"Repository: {repo['full_name']}\nDescription: {description}\nTopics: {topics}",
                url=repo["html_url"],
                published_at=datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00")),
                metadata={
                    "stars": repo["stargazers_count"],
                    "language": repo.get("language", ""),
                    "topics": topics,
                },
            ))
        return docs
