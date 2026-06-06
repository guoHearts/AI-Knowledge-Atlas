"""LLM-powered knowledge extraction — RawDocument → entities + relationships."""

import json
import re
from typing import List, Tuple
from openai import AsyncOpenAI
from extractors.base import RawDocument
from models.graph import GraphNode, GraphEdge, NodeType, RelationType


class KnowledgeExtractor:
    """Extract entities and relationships from text documents using an LLM."""

    def __init__(self, model_name: str = "gpt-4o", api_key: str = "", base_url: str = ""):
        self.model_name = model_name
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url or "https://api.openai.com/v1",
        )

    async def extract(self, doc: RawDocument) -> Tuple[List[GraphNode], List[GraphEdge]]:
        """Extract entities and relationships from a single document."""
        from knowledge.prompts import EXTRACTION_SYSTEM, EXTRACTION_USER_TEMPLATE

        completion = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": EXTRACTION_SYSTEM},
                {"role": "user", "content": EXTRACTION_USER_TEMPLATE.format(
                    source=doc.source,
                    title=doc.title,
                    content=doc.content[:4000],
                )},
            ],
            temperature=0.1,
            max_tokens=2048,
        )

        raw_content = completion.choices[0].message.content or ""
        raw_json = self._extract_json(raw_content)

        if not raw_json:
            return [], []

        nodes = self._parse_nodes(raw_json.get("entities", []), doc)
        edges = self._parse_edges(raw_json.get("relationships", []))
        return nodes, edges

    def _extract_json(self, text: str) -> dict | None:
        """Extract JSON from LLM response (may be wrapped in markdown code block)."""
        # Try to find JSON block
        match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
        json_str = match.group(1) if match else text
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            return None

    def _parse_nodes(self, entities: list, doc: RawDocument) -> List[GraphNode]:
        nodes = []
        valid_types = {t.value for t in NodeType}
        for e in entities:
            node_type = e.get("type", "Technology")
            if node_type not in valid_types:
                node_type = "Technology"
            nodes.append(GraphNode(
                id=e.get("id", ""),
                name=e.get("name", ""),
                node_type=NodeType(node_type),
                description=e.get("description", ""),
                summary_zh=e.get("summary_zh", ""),
                source_urls=[doc.url],
                popularity=e.get("importance", 5.0) * 10,  # Scale 0-10 to 0-100
                metadata={
                    "extracted_from": doc.source,
                    "source_title": doc.title,
                },
            ))
        return nodes

    def _parse_edges(self, relationships: list) -> List[GraphEdge]:
        edges = []
        valid_relations = {r.value for r in RelationType}
        for r in relationships:
            relation = r.get("relation", "BASED_ON")
            if relation not in valid_relations:
                continue
            edges.append(GraphEdge(
                source_id=r.get("source", ""),
                target_id=r.get("target", ""),
                relation=RelationType(relation),
                evidence=r.get("evidence", ""),
            ))
        return edges
