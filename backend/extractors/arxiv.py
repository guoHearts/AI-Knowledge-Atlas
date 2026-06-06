"""arXiv API adapter — fetch latest papers from cs.AI, cs.CL, cs.CV."""

import aiohttp
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from typing import List
from extractors.base import BaseExtractor, RawDocument

ARXIV_CATEGORIES = ["cs.AI", "cs.CL", "cs.CV", "cs.LG", "cs.MA"]
ARXIV_API = "http://export.arxiv.org/api/query"


class ArxivExtractor(BaseExtractor):
    def name(self) -> str:
        return "arxiv"

    async def fetch(self, since: datetime | None = None) -> List[RawDocument]:
        if since is None:
            since = datetime.now(timezone.utc) - timedelta(days=1)

        documents = []
        for category in ARXIV_CATEGORIES:
            query = f"cat:{category}+AND+submittedDate:[{since.strftime('%Y%m%d%H%M')}+TO+999912312359]"
            params = {
                "search_query": query,
                "sortBy": "submittedDate",
                "sortOrder": "descending",
                "max_results": "20",
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(ARXIV_API, params=params) as resp:
                    if resp.status != 200:
                        continue
                    xml_text = await resp.text()
                    documents.extend(self._parse_xml(xml_text, category))
        return documents

    def _parse_xml(self, xml_text: str, category: str) -> List[RawDocument]:
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        root = ET.fromstring(xml_text)
        docs = []
        for entry in root.findall("atom:entry", ns):
            arxiv_id = entry.find("atom:id", ns).text.split("/abs/")[-1]
            title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
            summary = entry.find("atom:summary", ns).text.strip().replace("\n", " ")
            url = entry.find("atom:id", ns).text
            published = entry.find("atom:published", ns).text
            docs.append(RawDocument(
                source="arxiv",
                source_id=arxiv_id,
                title=title,
                content=f"Title: {title}\nAbstract: {summary}",
                url=url,
                published_at=datetime.fromisoformat(published.replace("Z", "+00:00")),
                metadata={"category": category},
            ))
        return docs
