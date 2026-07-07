import pytest
from src.tools.calculator import CalculatorTool, CalculatorParams


def test_calculator_addition():
    """Test calculator addition."""
    tool = CalculatorTool()
    
    params = CalculatorParams(operation="add", a=10, b=5)
    result = tool.execute(params)
    
    assert result["result"] == 15
    assert result["operation"] == "add"


def test_calculator_subtraction():
    """Test calculator subtraction."""
    tool = CalculatorTool()
    
    params = CalculatorParams(operation="subtract", a=10, b=5)
    result = tool.execute(params)
    
    assert result["result"] == 5


def test_calculator_multiplication():
    """Test calculator multiplication."""
    tool = CalculatorTool()
    
    params = CalculatorParams(operation="multiply", a=10, b=5)
    result = tool.execute(params)
    
    assert result["result"] == 50


def test_calculator_division():
    """Test calculator division."""
    tool = CalculatorTool()
    
    params = CalculatorParams(operation="divide", a=10, b=5)
    result = tool.execute(params)
    
    assert result["result"] == 2.0


def test_calculator_division_by_zero():
    """Test calculator division by zero error."""
    tool = CalculatorTool()
    
    params = CalculatorParams(operation="divide", a=10, b=0)
    
    with pytest.raises(ValueError, match="Division by zero"):
        tool.execute(params)


def test_calculator_parameters_validation():
    """Test calculator parameter validation."""
    # Valid parameters
    valid_params = CalculatorParams(operation="add", a=1.5, b=2.5)
    assert valid_params.a == 1.5
    assert valid_params.b == 2.5
    
    # Invalid operation
    with pytest.raises(ValueError):
        CalculatorParams(operation="invalid", a=1, b=2)


def test_calculator_tool_execution():
    """Test full calculator tool execution."""
    tool = CalculatorTool()
    
    response = tool.run({
        "operation": "multiply",
        "a": 12,
        "b": 8
    })
    
    assert response.success is True
    assert response.result["result"] == 96
    assert response.result["operation"] == "multiply"
    assert response.result["operands"]["a"] == 12
    assert response.result["operands"]["b"] == 8
