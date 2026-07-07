from typing import Literal, Dict, Any
from pydantic import Field
from .base import BaseTool, ToolParameters


class CalculatorParams(ToolParameters):
    """Parameters for calculator tool."""
    operation: Literal["add", "subtract", "multiply", "divide"]
    a: float = Field(..., description="First operand")
    b: float = Field(..., description="Second operand")


class CalculatorTool(BaseTool):
    """Performs basic arithmetic operations."""
    
    def __init__(self):
        super().__init__(
            name="calculator",
            description="Perform basic arithmetic operations (add, subtract, multiply, divide)"
        )
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["add", "subtract", "multiply", "divide"],
                    "description": "Mathematical operation to perform"
                },
                "a": {
                    "type": "number",
                    "description": "First operand"
                },
                "b": {
                    "type": "number",
                    "description": "Second operand"
                }
            },
            "required": ["operation", "a", "b"]
        }
    
    def validate_parameters(self, parameters: dict) -> CalculatorParams:
        return CalculatorParams(**parameters)
    
    def execute(self, params: CalculatorParams) -> Dict[str, float]:
        """Execute the calculator operation."""
        operation = params.operation
        a = params.a
        b = params.b
        
        if operation == "add":
            result = a + b
        elif operation == "subtract":
            result = a - b
        elif operation == "multiply":
            result = a * b
        elif operation == "divide":
            if b == 0:
                raise ValueError("Division by zero is not allowed")
            result = a / b
        else:
            raise ValueError(f"Unknown operation: {operation}")
        
        return {
            "result": result,
            "operation": operation,
            "operands": {"a": a, "b": b}
        }