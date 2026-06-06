"""Data pipeline orchestrator — fetch → deduplicate → extract → store."""

import asyncio
from typing import List
from extractors.base import BaseExtractor, RawDocument
from knowledge.extractor import KnowledgeExtractor
from knowledge.deduplicator import build_deduplicator, Deduplicator
from models.repository import GraphRepository


class DataPipeline:
    """Orchestrates the full pipeline: fetch from sources, extract knowledge, store in Neo4j."""

    def __init__(
        self,
        extractors: List[BaseExtractor],
        knowledge_extractor: KnowledgeExtractor,
        repository: GraphRepository,
    ):
        self.extractors = extractors
        self.knowledge_extractor = knowledge_extractor
        self.repository = repository

    async def run(self) -> dict:
        """Run full pipeline and return stats."""
        stats = {
            "documents_fetched": 0,
            "documents_skipped": 0,
            "documents_processed": 0,
            "nodes_created": 0,
            "edges_created": 0,
            "errors": [],
        }

        # Phase 0: Build deduplicator from existing graph data
        dedup = self._build_deduplicator()

        # Phase 1: Fetch from all sources in parallel
        fetch_tasks = [ext.fetch() for ext in self.extractors]
        results = await asyncio.gather(*fetch_tasks, return_exceptions=True)

        all_docs: List[RawDocument] = []
        for i, result in enumerate(results):
            if isinstance(result, BaseException):
                stats["errors"].append(f"{self.extractors[i].name()}: {result}")
            else:
                all_docs.extend(result)  # pyright: ignore[reportArgumentType]

        stats["documents_fetched"] = len(all_docs)

        # Phase 2: Deduplicate — skip known documents
        fresh_docs: List[RawDocument] = []
        for doc in all_docs:
            if dedup.is_duplicate(doc):
                stats["documents_skipped"] += 1
            else:
                fresh_docs.append(doc)

        stats["documents_processed"] = len(fresh_docs)

        # Phase 3: Extract knowledge from each fresh document
        for doc in fresh_docs:
            try:
                nodes, edges = await self.knowledge_extractor.extract(doc)
                for node in nodes:
                    self.repository.upsert_node(node)
                    stats["nodes_created"] += 1
                for edge in edges:
                    self.repository.upsert_edge(edge)
                    stats["edges_created"] += 1
                # Register as seen after successful extraction
                dedup.register(doc)
                await asyncio.sleep(0.1)  # Rate limit for API calls
            except Exception as e:
                stats["errors"].append(f"Extraction failed for {doc.title[:50]}: {e}")

        return stats

    def _build_deduplicator(self) -> Deduplicator:
        """Load existing node URLs and titles from the graph for dedup."""
        try:
            existing_nodes = self.repository.get_all_nodes(limit=5000)
            known_urls: List[str] = []
            known_titles: List[str] = []
            for node in existing_nodes:
                known_urls.extend(node.source_urls)
                if node.name:
                    known_titles.append(node.name)
            return build_deduplicator(
                known_urls=list(set(known_urls)),
                known_titles=known_titles,
                threshold=0.85,
            )
        except Exception:
            # If graph is empty or unreachable, start with empty dedup
            return build_deduplicator(known_urls=[], known_titles=[])
