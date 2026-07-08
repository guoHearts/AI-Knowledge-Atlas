"""Content service helpers for course and pattern endpoints."""


class ContentService:
    def list_design_patterns(self) -> list[dict[str, str]]:
        return [
            {"id": "pipeline", "name": "pipeline", "title": "Pipeline 模式", "category": "orchestration"},
            {"id": "router", "name": "router", "title": "Router 模式", "category": "orchestration"},
            {
                "id": "orchestrator-worker",
                "name": "orchestrator-worker",
                "title": "Orchestrator-Worker 模式",
                "category": "collaboration",
            },
            {
                "id": "fan-out-fan-in",
                "name": "fan-out-fan-in",
                "title": "Fan-out/Fan-in 模式",
                "category": "collaboration",
            },
            {
                "id": "human-in-the-loop",
                "name": "human-in-the-loop",
                "title": "Human-in-the-loop 模式",
                "category": "quality",
            },
            {
                "id": "self-healing",
                "name": "self-healing",
                "title": "Self-healing 模式",
                "category": "quality",
            },
            {
                "id": "verifier-generator",
                "name": "verifier-generator",
                "title": "Verifier-Generator 模式",
                "category": "quality",
            },
        ]

    def get_lessons_for_graph_node(self, node_id: str) -> dict[str, object]:
        return {"node_id": node_id, "lessons": []}

