"""AI content generation pipeline using LangGraph.

Implements the 6-step content generation pipeline described in the design doc:
  1. Knowledge Retrieval (RAG over Neo4j)
  2. Enterprise Scenario Research (Web Search)
  3. Course Outline Generation (LLM)
  4. Per-Lesson Generation (LLM × loop)
  5. Code Sample Verification (LLM + sandbox)
  6. Consistency Check (LLM)

The pipeline is designed with:
  - Human-in-the-loop at outline approval and final publish
  - Self-healing code verification loop
  - Fan-out parallel lesson generation
"""
from typing import TypedDict, List
from dataclasses import dataclass


@dataclass
class PipelineConfig:
    """Configuration for the content generation pipeline."""
    model_name: str = "gpt-4o"
    api_key: str = ""
    base_url: str = ""
    max_retries: int = 3
    parallel_lessons: int = 4


class PipelineState(TypedDict, total=False):
    """State that flows through the LangGraph pipeline."""
    topic: str
    target_audience: str
    difficulty: str

    # Step 1-2 outputs
    knowledge_results: List[dict]
    enterprise_scenarios: List[dict]

    # Step 3 outputs
    outline: dict
    approved_outline: bool

    # Step 4 outputs
    lessons: List[dict]
    code_samples: List[dict]

    # Step 5 outputs
    verification_results: List[dict]
    all_verified: bool

    # Step 6 outputs
    consistency_report: dict

    # Metadata
    errors: List[str]
    current_step: str


class ContentPipeline:
    """LangGraph-based content generation pipeline.

    Usage:
        pipeline = ContentPipeline(PipelineConfig(model_name="gpt-4o", api_key="..."))
        result = await pipeline.run(topic="企业级 Agent 可观测性")
    """

    def __init__(self, config: PipelineConfig):
        self.config = config
        self._graph = None  # Built lazily

    async def run(self, topic: str, target_audience: str = "beginner") -> PipelineState:
        """Execute the full content generation pipeline."""
        state: PipelineState = {
            "topic": topic,
            "target_audience": target_audience,
            "difficulty": "beginner",
            "knowledge_results": [],
            "enterprise_scenarios": [],
            "outline": {},
            "approved_outline": False,
            "lessons": [],
            "code_samples": [],
            "verification_results": [],
            "all_verified": False,
            "consistency_report": {},
            "errors": [],
            "current_step": "init",
        }

        # Step 1: Knowledge Retrieval
        state = await self._step_retrieve_knowledge(state)

        # Step 2: Enterprise Research
        state = await self._step_search_enterprise(state)

        # Step 3: Outline Generation
        state = await self._step_generate_outline(state)

        # Steps 4-6 require LangGraph for complex control flow
        # In Phase 1, we implement the simple sequential version
        # Phase 2 will add the full LangGraph state machine

        return state

    async def _step_retrieve_knowledge(self, state: PipelineState) -> PipelineState:
        """Step 1: Retrieve relevant knowledge from Neo4j graph."""
        state["current_step"] = "retrieve_knowledge"
        # In production: query Neo4j for related nodes
        state["knowledge_results"] = [
            {"source": "knowledge_graph", "topic": state["topic"], "nodes_found": 0}
        ]
        return state

    async def _step_search_enterprise(self, state: PipelineState) -> PipelineState:
        """Step 2: Search for enterprise scenarios and real-world use cases."""
        state["current_step"] = "search_enterprise"
        state["enterprise_scenarios"] = [
            {"source": "web_search", "query": f"{state['topic']} enterprise production"}
        ]
        return state

    async def _step_generate_outline(self, state: PipelineState) -> PipelineState:
        """Step 3: Generate course outline with LLM."""
        state["current_step"] = "generate_outline"
        state["outline"] = {
            "modules": [],
            "total_lessons": 0,
            "estimated_hours": 0,
        }
        return state
