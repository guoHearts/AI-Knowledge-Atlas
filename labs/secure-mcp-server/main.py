#!/usr/bin/env python3
"""
Main entry point for Secure MCP Server.
"""

import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

if __name__ == "__main__":
    from src.main import app
    from src.config import settings
    import uvicorn
    
    print(f"Starting Secure MCP Server on {settings.host}:{settings.port}")
    print(f"Allowed tools: {settings.security.allowed_tools}")
    print(f"API docs: http://{settings.host}:{settings.port}/docs")
    
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )  
