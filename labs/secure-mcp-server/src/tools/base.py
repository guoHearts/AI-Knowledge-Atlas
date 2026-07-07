from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Dict, Any
from ..security import SecurityManager


class ToolParameters(BaseModel):
    """Base class for all tool parameters."""
    pass


class ToolResponse(BaseModel):
    """Standard response format for all tools."""
    success: bool
    result: Any
    message: str = ""


class BaseTool(ABC):
    """Base class for all MCP tools."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.security = SecurityManager()
    
    @property
    @abstractmethod
    def parameters_schema(self) -> Dict[str, Any]:
        """Return the JSON schema for tool parameters."""
        pass
    
    @abstractmethod
    def validate_parameters(self, parameters: dict) -> ToolParameters:
        """Validate and parse tool parameters."""
        pass
    
    @abstractmethod
    def execute(self, params: ToolParameters) -> Any:
        """Execute the tool logic."""
        pass
    
    def run(self, parameters: dict) -> ToolResponse:
        """Main entry point for tool execution."""
        try:
            # Sanitize parameters
            sanitized_params = self.security.sanitize_parameters(parameters)
            
            # Validate parameters
            validated_params = self.validate_parameters(sanitized_params)
            
            # Execute tool
            result = self.execute(validated_params)
            
            return ToolResponse(
                success=True,
                result=result,
                message="Tool executed successfully"
            )
            
        except Exception as e:
            return ToolResponse(
                success=False,
                result=None,
                message=f"Tool execution failed: {str(e)}"
            )