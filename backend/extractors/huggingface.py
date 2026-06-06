"""Hugging Face Daily Papers API adapter."""

import aiohttp
from datetime import datetime, timezone, timedelta
from typing import List
from extractors.base import BaseExtractor, RawDocument

HF_API = "https://huggingface.co/api/daily_papers"


class HuggingFaceExtractor(BaseExtractor):
    def name(self) -> str:
        return "huggingface"

    async def fetch(self, since: datetime | None = None) -> List[RawDocument]:
        if since is None:
            since = datetime.now(timezone.utc) - timedelta(days=3)

        async with aiohttp.ClientSession() as session:
            async with session.get(HF_API) as resp:
                if resp.status != 200:
                    return []
                papers = await resp.json()

        docs = []
        for paper in papers:
            pub_date = datetime.fromisoformat(paper.get("publishedAt", "").replace("Z", "+00:00"))
            if pub_date < since:
                continue
            paper_id = paper.get("paper", {}).get("id", "")
            title = paper.get("paper", {}).get("title", "")
            summary = paper.get("paper", {}).get("summary", "")
            docs.append(RawDocument(
                source="huggingface",
                source_id=paper_id,
                title=title,
                content=f"Title: {title}\nSummary: {summary}",
                url=f"https://huggingface.co/papers/{paper_id}",
                published_at=pub_date,
                metadata={"upvotes": paper.get("paper", {}).get("upvotes", 0)},
            ))
        return docs
