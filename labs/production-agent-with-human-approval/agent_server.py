#!/usr/bin/env python3
"""
Production Agent Server with Human Approval Workflow
"""

import os
import sys

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

if __name__ == "__main__":
    from src.main import app
    from src.config import settings
    import uvicorn
    
    print(f"Starting Production Agent Server on {settings.host}:{settings.agent_port}")
    print(f"Dashboard available at: http://{settings.host}:{settings.dashboard_port}")
    print(f"Health check: http://{settings.host}:{settings.agent_port}/health")
    
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.agent_port,
        reload=True
    )