from typing import Dict, Any, List
from pydantic import Field
from .base import BaseTool, ToolParameters
import random


class SearchParams(ToolParameters):
    """Parameters for search tool."""
    query: str = Field(..., min_length=1, max_length=500)
    limit: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Number of results to return (1-10)"
    )


class SearchTool(BaseTool):
    """Web search functionality."""
    
    def __init__(self):
        super().__init__(
            name="search",
            description="Perform web search and return relevant results"
        )
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 500,
                    "description": "Search query"
                },
                "limit": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 10,
                    "default": 5,
                    "description": "Number of results to return"
                }
            },
            "required": ["query"]
        }
    
    def validate_parameters(self, parameters: dict) -> SearchParams:
        return SearchParams(**parameters)
    
    def execute(self, params: SearchParams) -> Dict[str, Any]:
        """Execute the search.
        
        Note: This is a demo implementation that returns mock data.
        In production, you would integrate with a real search API.
        """
        query = params.query
        limit = params.limit
        
        # Mock search results - in production, call real search API
        mock_results = []
        
        for i in range(limit):
            mock_results.append({
                "title": f"Result {i+1} for '{query}'",
                "url": f"https://example{i+1}.com/{query.replace(' ', '-').lower()}",
                "snippet": f"This is a mock search result snippet for '{query}'. It contains relevant information about the search query and would normally be extracted from actual web pages.",
                "relevance_score": round(random.uniform(0.5, 1.0), 2)
            })
        
        # Sort by relevance (highest first)
        mock_results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return {
            "query": query,
            "total_results": len(mock_results),
            "results": mock_results,
            "timestamp": "2026-07-07T12:00:00Z"
        }