"""RSS feed adapter for company tech blogs."""

import aiohttp
import feedparser
from datetime import datetime, timezone, timedelta
from typing import List
from extractors.base import BaseExtractor, RawDocument

DEFAULT_FEEDS = [
    ("openai", "https://openai.com/blog/rss.xml"),
    ("anthropic", "https://www.anthropic.com/blog/rss.xml"),
    ("deepmind", "https://deepmind.google/blog/rss.xml"),
    ("meta-ai", "https://ai.meta.com/blog/feed/"),
]


class RSSExtractor(BaseExtractor):
    def __init__(self, feeds: list[tuple[str, str]] | None = None):
        self.feeds = feeds or DEFAULT_FEEDS

    def name(self) -> str:
        return "rss"

    async def fetch(self, since: datetime | None = None) -> List[RawDocument]:
        if since is None:
            since = datetime.now(timezone.utc) - timedelta(days=7)

        docs = []
        for source_name, feed_url in self.feeds:
            async with aiohttp.ClientSession() as session:
                async with session.get(feed_url) as resp:
                    if resp.status != 200:
                        continue
                    xml_text = await resp.text()

            feed = feedparser.parse(xml_text)
            for entry in feed.entries[:20]:
                pub_time = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub_time = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                    pub_time = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
                else:
                    pub_time = datetime.now(timezone.utc)

                if pub_time < since:
                    continue

                content = entry.get("summary", "") or entry.get("content", [{}])[0].get("value", "")
                docs.append(RawDocument(
                    source=f"rss-{source_name}",
                    source_id=entry.get("id", entry.get("link", "")),
                    title=entry.get("title", ""),
                    content=content[:3000],  # Truncate long posts
                    url=entry.get("link", ""),
                    published_at=pub_time,
                    metadata={"blog": source_name},
                ))
        return docs
