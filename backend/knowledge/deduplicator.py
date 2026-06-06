"""Deduplication — skip documents that match existing nodes by URL or title similarity."""

from difflib import SequenceMatcher
from typing import List, Set
from extractors.base import RawDocument


class Deduplicator:
    """Checks whether a RawDocument is already represented in the graph.

    Strategy (ordered by speed):
      1. URL exact match — if any source_url already stored, skip.
      2. Title fuzzy match — Levenshtein-like similarity > threshold, skip.
    """

    def __init__(self, known_urls: Set[str], known_titles: List[str], threshold: float = 0.85):
        self._known_urls = known_urls
        self._known_titles = known_titles
        self.threshold = threshold

    def is_duplicate(self, doc: RawDocument) -> bool:
        """Return True if the document appears to already exist in the graph."""
        # 1. URL exact match
        if doc.url and doc.url in self._known_urls:
            return True

        # 2. Title fuzzy match
        title = doc.title.strip().lower()
        for known in self._known_titles:
            if SequenceMatcher(None, title, known.lower()).ratio() >= self.threshold:
                return True

        return False

    def register(self, doc: RawDocument) -> None:
        """Add a document's identifiers to the dedup set after successful extraction."""
        if doc.url:
            self._known_urls.add(doc.url)
        self._known_titles.append(doc.title.strip())


def build_deduplicator(known_urls: List[str], known_titles: List[str], threshold: float = 0.85) -> Deduplicator:
    """Factory — builds a Deduplicator pre-loaded with existing graph data."""
    return Deduplicator(
        known_urls=set(known_urls),
        known_titles=known_titles,
        threshold=threshold,
    )
