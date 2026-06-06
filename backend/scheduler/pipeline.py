"""Data pipeline orchestrator — fetch → extract → deduplicate → store."""

import asyncio
from datetime import datetime, timezone
from typing import List
from extractors.base import BaseExtractor, RawDocument
from knowledge.extractor import KnowledgeExtractor
from models.graph import GraphNode, GraphEdge
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
        stats = {"documents_fetched": 0, "nodes_created": 0, "edges_created": 0, "errors": []}

        # Phase 1: Fetch from all sources in parallel
        fetch_tasks = [ext.fetch() for ext in self.extractors]
        results = await asyncio.gather(*fetch_tasks, return_exceptions=True)

        all_docs: List[RawDocument] = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                stats["errors"].append(f"{self.extractors[i].name()}: {result}")
            else:
                all_docs.extend(result)

        stats["documents_fetched"] = len(all_docs)

        # Phase 2: Extract knowledge from each document
        for doc in all_docs:
            try:
                nodes, edges = await self.knowledge_extractor.extract(doc)
                for node in nodes:
                    self.repository.upsert_node(node)
                    stats["nodes_created"] += 1
                for edge in edges:
                    self.repository.upsert_edge(edge)
                    stats["edges_created"] += 1
                await asyncio.sleep(0.1)  # Rate limit for API calls
            except Exception as e:
                stats["errors"].append(f"Extraction failed for {doc.title[:50]}: {e}")

        return stats
