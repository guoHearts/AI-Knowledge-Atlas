import uuid
import time
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import settings
from .security import SecurityManager, AuditLogger
from .tools.calculator import CalculatorTool
from .tools.weather import WeatherTool
from .tools.search import SearchTool


# API key security
api_key_header = APIKeyHeader(name="X-API-Key")


class ToolExecutionRequest(BaseModel):
    """Request model for tool execution."""
    tool: str
    parameters: Dict[str, Any]


class ToolExecutionResponse(BaseModel):
    """Response model for tool execution."""
    success: bool
    result: Optional[Any] = None
    error_message: Optional[str] = None
    execution_id: str
    timestamp: str


class AvailableToolsResponse(BaseModel):
    """Response model for available tools."""
    tools: list


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    timestamp: str
    version: str


# Initialize FastAPI app
app = FastAPI(
    title="Secure MCP Server",
    description="A production-ready MCP server with security features",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize components
security_manager = SecurityManager()
audit_logger = AuditLogger()

# Register available tools
tools = {
    "calculator": CalculatorTool(),
    "weather": WeatherTool(),
    "search": SearchTool(),
}


async def verify_api_key(api_key: str = Depends(api_key_header)) -> str:
    """Verify the API key."""
    if api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key


@app.get("/mcp/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat() + "Z",
        version="1.0.0"
    )


@app.get("/mcp/tools", response_model=AvailableToolsResponse)
async def get_available_tools(api_key: str = Depends(verify_api_key)):
    """Get list of available tools."""
    tool_list = []
    
    for name, tool in tools.items():
        if name in settings.security.allowed_tools:
            tool_list.append({
                "name": name,
                "description": tool.description,
                "parameters": tool.parameters_schema
            })
    
    return AvailableToolsResponse(tools=tool_list)


@app.post("/mcp/execute", response_model=ToolExecutionResponse)
async def execute_tool(
    request: ToolExecutionRequest,
    api_key: str = Depends(verify_api_key)
):
    """Execute a tool with security validation."""
    execution_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        # Check if tool is allowed
        if not security_manager.is_tool_allowed(request.tool):
            error_msg = f"Tool '{request.tool}' is not in the allowlist"
            audit_logger.log_execution(
                tool_name=request.tool,
                parameters=request.parameters,
                execution_id=execution_id,
                user_id=api_key,
                success=False,
                error_message=error_msg,
                execution_time=time.time() - start_time
            )
            raise HTTPException(status_code=403, detail=error_msg)
        
        # Check if tool exists
        if request.tool not in tools:
            error_msg = f"Tool '{request.tool}' not found"
            audit_logger.log_execution(
                tool_name=request.tool,
                parameters=request.parameters,
                execution_id=execution_id,
                user_id=api_key,
                success=False,
                error_message=error_msg,
                execution_time=time.time() - start_time
            )
            raise HTTPException(status_code=404, detail=error_msg)
        
        # Execute the tool
        tool = tools[request.tool]
        result = tool.run(request.parameters)
        
        execution_time = time.time() - start_time
        
        # Log the execution
        audit_logger.log_execution(
            tool_name=request.tool,
            parameters=request.parameters,
            execution_id=execution_id,
            user_id=api_key,
            success=result.success,
            error_message=result.message if not result.success else None,
            execution_time=execution_time
        )
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)
        
        return ToolExecutionResponse(
            success=True,
            result=result.result,
            execution_id=execution_id,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        execution_time = time.time() - start_time
        
        # Log the error
        audit_logger.log_execution(
            tool_name=request.tool,
            parameters=request.parameters,
            execution_id=execution_id,
            user_id=api_key,
            success=False,
            error_message=str(e),
            execution_time=execution_time
        )
        
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint with basic info."""
    return {
        "message": "Secure MCP Server",
        "version": "1.0.0",
        "docs": "/docs",
        "tools_endpoint": "/mcp/tools"
    }


if __name__ == "__main__":
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