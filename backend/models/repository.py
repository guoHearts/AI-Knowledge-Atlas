"""Neo4j data access layer — all graph operations through this module."""

import json
from neo4j import Driver
from models.graph import GraphNode, GraphEdge, NodeType, NodeDetail, Subgraph
from typing import List, Optional, Any

# List of our node labels for extracting node_type from Neo4j labels
_NODE_LABELS = ["Technology", "Model", "Product", "AgentFramework", "AgentType", "Company", "Paper", "Benchmark"]


def _node_type_from_labels(labels: List[str]) -> str:
    """Extract our node_type from Neo4j labels."""
    for label in labels:
        if label in _NODE_LABELS:
            return label
    return "Technology"


def _record_to_node(data: dict[str, Any]) -> GraphNode:
    """Convert a Neo4j node record dict to GraphNode, handling labels and datetime conversion."""
    # Extract node_type from labels if present, otherwise try to infer or default
    if "_labels" in data:
        data["node_type"] = _node_type_from_labels(data.pop("_labels"))
    elif "node_type" not in data:
        data["node_type"] = "Technology"
    # Convert neo4j datetime objects to Python datetime
    for key in ("first_seen", "last_updated"):
        if key in data and data[key] is not None and hasattr(data[key], "to_native"):
            data[key] = data[key].to_native()
    # Parse metadata from JSON string
    if "metadata" in data and isinstance(data["metadata"], str):
        try:
            data["metadata"] = json.loads(data["metadata"])
        except (json.JSONDecodeError, TypeError):
            data["metadata"] = {}
    return GraphNode(**data)


class GraphRepository:
    def __init__(self, driver: Driver):
        self.driver = driver

    # ── Node CRUD ──────────────────────────────────────────

    def upsert_node(self, node: GraphNode) -> GraphNode:
        """Create or update a node. Match on (type, id)."""
        # Serialize metadata as JSON string for Neo4j property compatibility
        metadata_json = json.dumps(node.metadata, ensure_ascii=False) if node.metadata else "{}"
        with self.driver.session() as session:
            result = session.run(
                f"""
                MERGE (n:{node.node_type.value} {{id: $id}})
                SET n.name = $name,
                    n.description = $description,
                    n.summary_zh = $summary_zh,
                    n.source_urls = $source_urls,
                    n.popularity = $popularity,
                    n.metadata = $metadata,
                    n.last_updated = datetime()
                FOREACH (_ IN CASE WHEN n.first_seen IS NULL THEN [1] ELSE [] END |
                    SET n.first_seen = datetime()
                )
                RETURN n {{ .* }} AS props, labels(n) AS _labels
                """,
                id=node.id,
                name=node.name,
                description=node.description,
                summary_zh=node.summary_zh,
                source_urls=node.source_urls,
                popularity=node.popularity,
                metadata=metadata_json,
            )
            record = result.single()
            props = dict(record["props"])
            props["_labels"] = record["_labels"]
            return _record_to_node(props)

    def get_node(self, node_type: str, node_id: str) -> Optional[GraphNode]:
        with self.driver.session() as session:
            result = session.run(
                f"MATCH (n:{node_type} {{id: $id}}) RETURN n {{ .* }} AS props, labels(n) AS _labels",
                id=node_id,
            )
            record = result.single()
            if record:
                props = dict(record["props"])
                props["_labels"] = record["_labels"]
                return _record_to_node(props)
            return None

    def search_nodes(self, query: str, limit: int = 20) -> List[GraphNode]:
        """Fulltext search across all node types."""
        with self.driver.session() as session:
            result = session.run(
                """
                CALL db.index.fulltext.queryNodes('node_fulltext', $search_query)
                YIELD node, score
                RETURN node { .* } AS props, labels(node) AS _labels, score
                ORDER BY score DESC
                LIMIT $limit
                """,
                search_query=query,
                limit=limit,
            )
            nodes = []
            for r in result:
                props = dict(r["props"])
                props["_labels"] = r["_labels"]
                nodes.append(_record_to_node(props))
            return nodes

    def get_nodes_by_type(self, node_type: NodeType, limit: int = 100) -> List[GraphNode]:
        with self.driver.session() as session:
            result = session.run(
                f"MATCH (n:{node_type.value}) RETURN n {{ .* }} AS props, labels(n) AS _labels ORDER BY n.popularity DESC LIMIT $limit",
                limit=limit,
            )
            nodes = []
            for r in result:
                props = dict(r["props"])
                props["_labels"] = r["_labels"]
                nodes.append(_record_to_node(props))
            return nodes

    def get_all_nodes(self, limit: int = 500) -> List[GraphNode]:
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (n)
                WHERE n:Technology OR n:Model OR n:Product OR n:AgentFramework
                   OR n:AgentType OR n:Company OR n:Paper OR n:Benchmark
                RETURN n { .* } AS props, labels(n) AS _labels
                ORDER BY n.popularity DESC
                LIMIT $limit
                """,
                limit=limit,
            )
            nodes = []
            for r in result:
                props = dict(r["props"])
                props["_labels"] = r["_labels"]
                nodes.append(_record_to_node(props))
            return nodes

    # ── Edge CRUD ──────────────────────────────────────────

    def upsert_edge(self, edge: GraphEdge) -> GraphEdge:
        """Create or update a relationship between two nodes."""
        with self.driver.session() as session:
            result = session.run(
                f"""
                MATCH (a {{id: $source_id}})
                MATCH (b {{id: $target_id}})
                MERGE (a)-[r:{edge.relation.value}]->(b)
                SET r.weight = $weight,
                    r.evidence = $evidence,
                    r.updated_at = datetime()
                FOREACH (_ IN CASE WHEN r.created_at IS NULL THEN [1] ELSE [] END |
                    SET r.created_at = datetime()
                )
                RETURN type(r) AS relation, r.weight AS weight, r.evidence AS evidence
                """,
                source_id=edge.source_id,
                target_id=edge.target_id,
                weight=edge.weight,
                evidence=edge.evidence,
            )
            record = result.single()
            return GraphEdge(
                source_id=edge.source_id,
                target_id=edge.target_id,
                relation=edge.relation,
                weight=record["weight"],
                evidence=record.get("evidence", ""),
            )

    def get_all_edges(self, limit: int = 1000) -> List[GraphEdge]:
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (a)-[r]->(b)
                WHERE type(r) IN ['BASED_ON','PROPOSED_BY','RELEASED','COMPETES_WITH',
                                  'BELONGS_TO','POWERS','EVALUATED_BY','CATEGORY_OF','IMPROVES']
                RETURN a.id AS source_id, b.id AS target_id, type(r) AS relation,
                       r.weight AS weight, r.evidence AS evidence
                LIMIT $limit
                """,
                limit=limit,
            )
            return [
                GraphEdge(
                    source_id=r["source_id"],
                    target_id=r["target_id"],
                    relation=r["relation"],
                    weight=r["weight"],
                    evidence=r.get("evidence", ""),
                )
                for r in result
            ]

    # ── Graph queries ──────────────────────────────────────

    def get_neighbors(self, node_id: str) -> NodeDetail:
        """Get a node plus its immediate neighbors and relationships."""
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (center {id: $node_id})
                OPTIONAL MATCH (center)-[out]->(neighbor_out)
                OPTIONAL MATCH (neighbor_in)-[inc]->(center)
                RETURN center { .* } AS props,
                       labels(center) AS _labels,
                       collect(DISTINCT {
                           source_id: center.id,
                           target_id: neighbor_out.id,
                           relation: type(out),
                           weight: out.weight,
                           evidence: out.evidence
                       }) AS outgoing,
                       collect(DISTINCT {
                           source_id: neighbor_in.id,
                           target_id: center.id,
                           relation: type(inc),
                           weight: inc.weight,
                           evidence: inc.evidence
                       }) AS incoming,
                       collect(DISTINCT neighbor_out { .*, _labels: labels(neighbor_out) }) AS out_neighbors,
                       collect(DISTINCT neighbor_in { .*, _labels: labels(neighbor_in) }) AS in_neighbors
                """,
                node_id=node_id,
            )
            record = result.single()
            if not record:
                return NodeDetail(node=None, incoming=[], outgoing=[], neighbor_nodes=[])

            center_props = dict(record["props"])
            center_props["_labels"] = record["_labels"]
            center_node = _record_to_node(center_props)

            outgoing = [GraphEdge(**e) for e in record["outgoing"] if e["target_id"]]
            incoming = [GraphEdge(**e) for e in record["incoming"] if e["source_id"]]
            neighbor_nodes = [
                _record_to_node(dict(n)) for n in (record["out_neighbors"] or []) + (record["in_neighbors"] or [])
                if n and n.get("id")
            ]
            return NodeDetail(
                node=center_node,
                incoming=incoming,
                outgoing=outgoing,
                neighbor_nodes=neighbor_nodes,
            )

    def get_subgraph(self, node_ids: List[str], depth: int = 1) -> Subgraph:
        """Get a subgraph containing specified nodes and their N-degree neighbors."""
        with self.driver.session() as session:
            result = session.run(
                f"""
                // Phase 1: collect all nodes (seeds + N-hop neighbors)
                MATCH (seed)
                WHERE seed.id IN $node_ids
                OPTIONAL MATCH (seed)-[*1..{depth}]-(neighbor)
                WITH collect(DISTINCT seed) + collect(DISTINCT neighbor) AS raw
                UNWIND raw AS n
                WITH DISTINCT n
                WITH collect(n) AS node_list
                // Phase 2: find edges between collected nodes
                UNWIND node_list AS a
                OPTIONAL MATCH (a)-[r]-(b)
                WHERE b IN node_list
                // Phase 3: return deduplicated data
                RETURN collect(DISTINCT a {{ .*, _labels: labels(a) }}) AS nodes,
                       collect(DISTINCT {{
                           source_id: startNode(r).id,
                           target_id: endNode(r).id,
                           relation: type(r),
                           weight: r.weight,
                           evidence: r.evidence
                       }}) AS edges
                """,
                node_ids=node_ids,
            )
            record = result.single()
            nodes = []
            for n in (record["nodes"] or []):
                if n and n.get("id"):
                    props = dict(n)
                    nodes.append(_record_to_node(props))
            edges = [GraphEdge(**e) for e in (record["edges"] or []) if e and e.get("source_id")]
            return Subgraph(nodes=nodes, edges=edges)

    def get_timeline(self, days: int = 30, limit: int = 50) -> List[GraphNode]:
        """Get nodes first seen in the last N days, newest first."""
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (n)
                WHERE n.first_seen IS NOT NULL
                  AND n.first_seen >= datetime() - duration({days: $days})
                RETURN n { .* } AS props, labels(n) AS _labels
                ORDER BY n.first_seen DESC
                LIMIT $limit
                """,
                days=days,
                limit=limit,
            )
            nodes = []
            for r in result:
                props = dict(r["props"])
                props["_labels"] = r["_labels"]
                nodes.append(_record_to_node(props))
            return nodes

    def get_stats(self) -> dict:
        """Get summary statistics about the graph — node/edge counts, last updated."""
        with self.driver.session() as session:
            # Node counts per type
            node_types = [
                "Technology", "Model", "Product", "AgentFramework",
                "AgentType", "Company", "Paper", "Benchmark",
            ]
            node_counts: dict = {}
            total_nodes = 0
            for nt in node_types:
                result = session.run(
                    f"MATCH (n:{nt}) RETURN count(n) AS cnt"
                )
                cnt = result.single()["cnt"]
                node_counts[nt] = cnt
                total_nodes += cnt

            # Edge counts per relation type
            edge_counts: dict = {}
            total_edges = 0
            relation_types = [
                "BASED_ON", "PROPOSED_BY", "RELEASED", "COMPETES_WITH",
                "BELONGS_TO", "POWERS", "EVALUATED_BY", "CATEGORY_OF", "IMPROVES",
            ]
            for rt in relation_types:
                result = session.run(
                    f"MATCH ()-[r:{rt}]->() RETURN count(r) AS cnt"
                )
                cnt = result.single()["cnt"]
                edge_counts[rt] = cnt
                total_edges += cnt

            # Last updated timestamp
            result = session.run(
                """
                MATCH (n)
                WHERE n.last_updated IS NOT NULL
                RETURN max(n.last_updated) AS last_updated
                """
            )
            last_updated_record = result.single()
            last_updated = None
            if last_updated_record and last_updated_record["last_updated"]:
                dt = last_updated_record["last_updated"]
                last_updated = dt.isoformat() if hasattr(dt, 'isoformat') else str(dt)

            return {
                "total_nodes": total_nodes,
                "total_edges": total_edges,
                "nodes_by_type": node_counts,
                "edges_by_type": edge_counts,
                "last_updated": last_updated,
            }
