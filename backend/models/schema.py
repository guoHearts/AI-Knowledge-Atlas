"""Neo4j schema initialization — constraints and indexes for the AI knowledge graph."""

from neo4j import Driver

CONSTRAINTS = [
    # Enforce unique node IDs per type
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Technology) REQUIRE n.id IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Model) REQUIRE n.id IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Product) REQUIRE n.id IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:AgentFramework) REQUIRE n.id IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:AgentType) REQUIRE n.id IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Company) REQUIRE n.id IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Paper) REQUIRE n.id IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Benchmark) REQUIRE n.id IS UNIQUE",
    # Unique name per type
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Technology) REQUIRE n.name IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Model) REQUIRE n.name IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Product) REQUIRE n.name IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:AgentFramework) REQUIRE n.name IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:AgentType) REQUIRE n.name IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Company) REQUIRE n.name IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Paper) REQUIRE n.name IS UNIQUE",
    "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Benchmark) REQUIRE n.name IS UNIQUE",
]

INDEXES = [
    # Fulltext index across all node types for search
    "CREATE FULLTEXT INDEX node_fulltext IF NOT EXISTS "
    "FOR (n:Technology|Model|Product|AgentFramework|AgentType|Company|Paper|Benchmark) "
    "ON EACH [n.name, n.description]",
    # Vector index: Neo4j Community may not support multi-label vector indexes.
    # Run separately per label if needed, or use CREATE VECTOR INDEX on a single label.
    # "CREATE VECTOR INDEX node_embeddings IF NOT EXISTS "
    # "FOR (n:Technology) ON (n.embedding) "
    # "OPTIONS {indexConfig: {`vector.dimensions`: 1536, `vector.similarity_function`: 'cosine'}}",
]


def init_schema(driver: Driver) -> None:
    """Create all constraints and indexes. Idempotent — safe to call on startup."""
    with driver.session() as session:
        for cypher in CONSTRAINTS + INDEXES:
            try:
                session.run(cypher)
            except Exception as e:
                print(f"[schema] Skipping (may already exist): {e}")
