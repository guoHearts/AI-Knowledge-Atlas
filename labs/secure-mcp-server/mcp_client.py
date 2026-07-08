"""
Simple MCP client for testing the secure MCP server.
"""

import requests
import json
from typing import Dict, Any, Optional


class MCPClient:
    """Simple client for interacting with the MCP server."""
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        })
    
    def health_check(self) -> Dict[str, Any]:
        """Check server health."""
        response = self.session.get(f"{self.base_url}/mcp/health")
        response.raise_for_status()
        return response.json()
    
    def get_available_tools(self) -> Dict[str, Any]:
        """Get list of available tools."""
        response = self.session.get(f"{self.base_url}/mcp/tools")
        response.raise_for_status()
        return response.json()
    
    def execute_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool."""
        payload = {
            "tool": tool_name,
            "parameters": parameters
        }
        
        response = self.session.post(
            f"{self.base_url}/mcp/execute",
            json=payload
        )
        
        if response.status_code == 401:
            raise Exception("Invalid API key")
        elif response.status_code == 403:
            raise Exception("Tool not allowed")
        elif response.status_code == 404:
            raise Exception("Tool not found")
        elif response.status_code == 400:
            error_data = response.json()
            raise Exception(f"Tool execution failed: {error_data.get('detail', 'Unknown error')}")
        elif response.status_code != 200:
            raise Exception(f"Server error: {response.status_code} - {response.text}")
        
        return response.json()
    
    def close(self):
        """Close the client session."""
        self.session.close()


# Example usage and testing
if __name__ == "__main__":
    # Configuration - update these values
    SERVER_URL = "http://localhost:8001"
    API_KEY = "your-secure-api-key-change-this-in-production"
    
    client = MCPClient(SERVER_URL, API_KEY)
    
    try:
        # Check server health
        print("Checking server health...")
        health = client.health_check()
        print(f"Server status: {health['status']}")
        
        # Get available tools
        print("\nGetting available tools...")
        tools = client.get_available_tools()
        print(f"Available tools: {len(tools['tools'])}")
        for tool in tools['tools']:
            print(f"  - {tool['name']}: {tool['description']}")
        
        # Test calculator tool
        print("\nTesting calculator tool...")
        calc_result = client.execute_tool("calculator", {
            "operation": "multiply",
            "a": 12,
            "b": 8
        })
        print(f"Calculator result: {calc_result['result']['result']}")
        
        # Test weather tool
        print("\nTesting weather tool...")
        weather_result = client.execute_tool("weather", {
            "city": "San Francisco",
            "units": "celsius"
        })
        print(f"Weather in {weather_result['result']['city']}: {weather_result['result']['temperature']}°{weather_result['result']['units'][0].upper()}")
        
        # Test search tool
        print("\nTesting search tool...")
        search_result = client.execute_tool("search", {
            "query": "MCP protocol",
            "limit": 3
        })
        print(f"Found {search_result['result']['total_results']} results for '{search_result['result']['query']}'")
        
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        client.close()