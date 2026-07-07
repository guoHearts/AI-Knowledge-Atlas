"""AI Engineering Radar API endpoints."""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import json

router = APIRouter(prefix="/radar", tags=["radar"])


# Sample radar items for v1
# In production, this would come from a database
SAMPLE_RADAR_ITEMS = [
    {
        "id": "openai-agents-sdk-2026-07",
        "title": "OpenAI Agents SDK 1.0 Released",
        "category": "agent-framework",
        "maturity": "Early Production",
        "summary": "OpenAI's first official Agent framework brings standardized tool calling patterns to production applications.",
        "why_it_matters": "Standardizes the agent architecture pattern with built-in safety guardrails, tracing, and structured outputs that enterprises need.",
        "recommended_for": "Teams building production agents with OpenAI models who want guardrails out of the box.",
        "not_recommended_for": "Applications requiring deep customization or multi-model support.",
        "has_lab": True,
        "lab_id": "production-agent-with-human-approval",
        "sources": [
            {
                "type": "official",
                "url": "https://platform.openai.com/docs/guides/agents",
                "title": "OpenAI Agents SDK Documentation"
            },
            {
                "type": "blog",
                "url": "https://openai.com/blog/introducing-the-agents-sdk",
                "title": "Introducing the Agents SDK"
            }
        ],
        "created_at": "2026-07-07T10:00:00Z",
        "updated_at": "2026-07-07T10:00:00Z",
        "last_verified_at": "2026-07-07T10:00:00Z"
    },
    {
        "id": "mcp-security-best-practices-2026-07",
        "title": "MCP Security Best Practices Emerge",
        "category": "mcp",
        "maturity": "Validated",
        "summary": "Security patterns for MCP servers including tool allowlists, parameter validation, and prompt injection defenses are becoming standardized.",
        "why_it_matters": "MCP's promise of reusable tools requires security-first thinking. These patterns prevent common pitfalls in production.",
        "recommended_for": "Anyone deploying MCP servers to production environments.",
        "not_recommended_for": "Local development only scenarios where security is not a concern.",
        "has_lab": True,
        "lab_id": "secure-mcp-server",
        "sources": [
            {
                "type": "community",
                "url": "https://modelcontextprotocol.io/security/security-guide",
                "title": "MCP Security Guide"
            },
            {
                "type": "research",
                "url": "https://arxiv.org/abs/2607.01234",
                "title": "Security Analysis of Tool-Calling Architectures"
            }
        ],
        "created_at": "2026-07-06T14:30:00Z",
        "updated_at": "2026-07-07T09:15:00Z",
        "last_verified_at": "2026-07-07T09:15:00Z"
    },
    {
        "id": "vector-databases-hybrid-search-2026-07",
        "title": "Hybrid Search Becomes Default",
        "category": "rag",
        "maturity": "Production-Ready",
        "summary": "Leading vector databases now default to hybrid search (vector + keyword) as the standard retrieval approach.",
        "why_it_matters": "Hybrid search consistently outperforms pure vector search, closing the relevance gap that has hindered RAG adoption.",
        "recommended_for": "All RAG applications targeting production use cases.",
        "not_recommended_for": "Simple demo applications where implementation complexity is the primary concern.",
        "has_lab": False,
        "lab_id": None,
        "sources": [
            {
                "type": "official",
                "url": "https://qdrant.tech/articles/hybrid-search",
                "title": "Qdrant Hybrid Search Announcement"
            },
            {
                "type": "official",
                "url": "https://weaviate.io/blog/hybrid-search",
                "title": "Weaviate Hybrid Search"
            }
        ],
        "created_at": "2026-07-05T11:20:00Z",
        "updated_at": "2026-07-06T16:45:00Z",
        "last_verified_at": "2026-07-06T16:45:00Z"
    }
]


@router.get("/items", response_model=List[Dict[str, Any]])
async def get_radar_items(category: str = None):
    """Get all radar items, optionally filtered by category."""
    items = SAMPLE_RADAR_ITEMS
    
    if category:
        items = [item for item in items if item["category"] == category]
    
    # Sort by creation date (newest first)
    items.sort(key=lambda x: x["created_at"], reverse=True)
    
    return items


@router.get("/items/{item_id}")
async def get_radar_item(item_id: str):
    """Get a specific radar item by ID."""
    for item in SAMPLE_RADAR_ITEMS:
        if item["id"] == item_id:
            return item
    
    raise HTTPException(status_code=404, detail="Radar item not found")


@router.get("/categories")
async def get_radar_categories():
    """Get all available radar item categories."""
    categories = set(item["category"] for item in SAMPLE_RADAR_ITEMS)
    
    # Add descriptions for known categories
    category_details = {
        "agent-framework": {
            "name": "Agent Frameworks",
            "description": "Frameworks for building and deploying AI agents"
        },
        "mcp": {
            "name": "Model Context Protocol", 
            "description": "Standardization and tool-calling protocols"
        },
        "rag": {
            "name": "Retrieval Augmented Generation",
            "description": "RAG techniques, tools, and best practices"
        },
        "evaluation": {
            "name": "AI Evaluation",
            "description": "Testing and evaluation of AI systems"
        },
        "llmops": {
            "name": "LLMOps",
            "description": "Operations and deployment for AI applications"
        },
        "model": {
            "name": "Foundation Models",
            "description": "New models and model capabilities"
        }
    }
    
    result = []
    for category in sorted(categories):
        if category in category_details:
            result.append({
                "id": category,
                "name": category_details[category]["name"],
                "description": category_details[category]["description"]
            })
        else:
            result.append({
                "id": category,
                "name": category.replace("-", " ").title(),
                "description": ""
            })
    
    return result


@router.get("/weekly/{week_number}")
async def get_weekly_radar(week_number: str):
    """Get radar items for a specific week."""
    # For demo purposes, return the same items for any week
    # In production, this would filter items by date ranges
    
    # Parse week string (e.g., "2026-W27")
    try:
        year, week = week_number.split("-")
        year = int(year)
        week = int(week.replace("W", ""))
        
        # Simple validation
        if year < 2024 or week < 1 or week > 53:
            raise ValueError()
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid week format. Use YYYY-W## (e.g., 2026-W27)")
    
    # In a real implementation, filter items by week
    # For demo, return all items
    return {
        "week": week_number,
        "period": {
            "start": "2026-07-01",  # Would calculate from week number
            "end": "2026-07-07"
        },
        "items": SAMPLE_RADAR_ITEMS,
        "summary": f"This week focuses on Agent frameworks and MCP security patterns, representing key trends in production AI engineering."
    }