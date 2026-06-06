"""Abstract base for data source adapters — all sources implement this interface."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import List


@dataclass
class RawDocument:
    """Unified document format from any source, ready for knowledge extraction."""
    source: str           # e.g. "arxiv", "hackernews"
    source_id: str        # unique ID at the source
    title: str
    content: str          # abstract, body, or summary
    url: str
    published_at: datetime
    metadata: dict = field(default_factory=dict)


class BaseExtractor(ABC):
    """Each data source gets an adapter implementing this interface."""

    @abstractmethod
    def name(self) -> str:
        """Unique source name, e.g. 'arxiv'."""
        ...

    @abstractmethod
    async def fetch(self, since: datetime | None = None) -> List[RawDocument]:
        """Fetch new documents since the given timestamp. If None, fetch recent."""
        ...
