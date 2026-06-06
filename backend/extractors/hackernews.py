"""Hacker News API adapter — fetch AI-related top stories."""

import aiohttp
from datetime import datetime, timezone, timedelta
from typing import List
from extractors.base import BaseExtractor, RawDocument

HN_TOP_STORIES = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM = "https://hacker-news.firebaseio.com/v0/item/{}.json"

AI_KEYWORDS = [
    "ai", "llm", "gpt", "claude", "gemini", "deepseek", "openai", "anthropic",
    "transformer", "agent", "rag", "ml", "machine learning", "neural", "fine-tun",
    "rlhf", "moe", "mixture of experts", "multimodal", "embedding", "vector",
    "langchain", "llama", "mistral", "qwen", "diffusion", "stable diffusion",
    "sora", "midjourney", "cursor", "copilot", "agi",
]


class HackerNewsExtractor(BaseExtractor):
    def name(self) -> str:
        return "hackernews"

    async def fetch(self, since: datetime | None = None) -> List[RawDocument]:
        if since is None:
            since = datetime.now(timezone.utc) - timedelta(days=2)

        async with aiohttp.ClientSession() as session:
            # Get top story IDs
            async with session.get(HN_TOP_STORIES) as resp:
                story_ids = await resp.json()

            docs = []
            for sid in story_ids[:100]:  # Check top 100
                async with session.get(HN_ITEM.format(sid)) as item_resp:
                    item = await item_resp.json()

                if not item or item.get("type") != "story":
                    continue

                title = item.get("title", "")
                url = item.get("url", f"https://news.ycombinator.com/item?id={sid}")
                text = item.get("text", "")

                combined = f"{title} {text}".lower()
                if not any(kw in combined for kw in AI_KEYWORDS):
                    continue

                pub_time = datetime.fromtimestamp(item.get("time", 0), tz=timezone.utc)
                if pub_time < since:
                    continue

                docs.append(RawDocument(
                    source="hackernews",
                    source_id=str(sid),
                    title=title,
                    content=f"Title: {title}\n{text}",
                    url=url,
                    published_at=pub_time,
                    metadata={"score": item.get("score", 0), "descendants": item.get("descendants", 0)},
                ))
            return docs
