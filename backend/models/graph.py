"""Pydantic models for graph entities — all 8 node types and 9 relation types."""

import json
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class NodeType(str, Enum):
    TECHNOLOGY = "Technology"
    MODEL = "Model"
    PRODUCT = "Product"
    AGENT_FRAMEWORK = "AgentFramework"
    AGENT_TYPE = "AgentType"
    COMPANY = "Company"
    PAPER = "Paper"
    BENCHMARK = "Benchmark"


class RelationType(str, Enum):
    BASED_ON = "BASED_ON"
    PROPOSED_BY = "PROPOSED_BY"
    RELEASED = "RELEASED"
    COMPETES_WITH = "COMPETES_WITH"
    BELONGS_TO = "BELONGS_TO"
    POWERS = "POWERS"
    EVALUATED_BY = "EVALUATED_BY"
    CATEGORY_OF = "CATEGORY_OF"
    IMPROVES = "IMPROVES"


class GraphNode(BaseModel):
    """Universal node model — all 8 types share this structure."""
    id: str = Field(description="Unique identifier (slug), e.g. 'claude-opus-4-8'")
    name: str = Field(description="Display name, e.g. 'Claude Opus 4.8'")
    node_type: NodeType
    description: str = ""
    summary_zh: str = Field(default="", description="Chinese summary")
    source_urls: List[str] = Field(default_factory=list, description="URLs this node was extracted from")
    first_seen: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    popularity: float = 0.0  # 0-100 score
    embedding: Optional[List[float]] = None
    metadata: dict = Field(default_factory=dict, description="Type-specific fields")

    @field_validator("metadata", mode="before")
    @classmethod
    def parse_metadata(cls, v: Any) -> dict:
        """Parse metadata from JSON string (Neo4j storage format) or pass through dict."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return {}
        if isinstance(v, dict):
            return v
        return {}

    @field_validator("first_seen", "last_updated", mode="before")
    @classmethod
    def parse_neo4j_datetime(cls, v: Any) -> Optional[datetime]:
        """Convert neo4j.time.DateTime to Python datetime, or pass through."""
        if v is None:
            return None
        if isinstance(v, datetime):
            return v
        # Handle neo4j.time.DateTime (has to_native / fromtimestamp methods)
        if hasattr(v, "to_native"):
            return v.to_native()
        if hasattr(v, "isoformat"):
            return datetime.fromisoformat(v.isoformat().replace("Z", "+00:00"))
        return v


class GraphEdge(BaseModel):
    """Universal relationship model."""
    source_id: str
    target_id: str
    relation: RelationType
    weight: float = 1.0
    evidence: str = Field(default="", description="Sentence or source that justifies this edge")


class Subgraph(BaseModel):
    """A slice of the graph returned for visualization."""
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class NodeDetail(BaseModel):
    """Full detail for the side panel — node + its immediate neighborhood."""
    node: Optional[GraphNode] = None
    incoming: List[GraphEdge] = Field(default_factory=list)
    outgoing: List[GraphEdge] = Field(default_factory=list)
    neighbor_nodes: List[GraphNode] = Field(default_factory=list)
